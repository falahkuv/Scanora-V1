from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import tensorflow as tf
import numpy as np
import io
from PIL import Image
import uvicorn
import os

app = FastAPI(title="Fruit Freshness API", description="API untuk mendeteksi tipe dan kesegaran buah")

# Tambahkan CORS agar bisa dipanggil dari domain mana saja (Vercel/Render)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Path ke model hasil training
MODEL_PATH = "fruit_model_revisi1.keras" # atau path yang absolut ke model Anda
IMG_SIZE = (224, 224)


# Mapping label - Sesuaikan dictionary ini dengan LabelEncoder aktual di dataset
idx_to_product = {0: "Apple", 1: "Banana", 2: "Orange", 3: "Others"}
idx_to_condition = {0: "others", 1: "ripe", 2: "rotten", 3: "unripe"}

# Mendifinisikan Custom Layer yang digunakan di model agar Keras bisa load dengan benar
from tensorflow.keras import layers

class SpatialAttentionLayer(layers.Layer):
    def __init__(self, **kwargs):
        super(SpatialAttentionLayer, self).__init__(**kwargs)
        self.conv = layers.Conv2D(1, kernel_size=7, padding="same", activation="sigmoid")

    def call(self, inputs):
        avg_pool = tf.reduce_mean(inputs, axis=-1, keepdims=True)
        max_pool = tf.reduce_max(inputs, axis=-1, keepdims=True)
        concat = tf.concat([avg_pool, max_pool], axis=-1)
        attention_map = self.conv(concat)
        return inputs * attention_map
        
    def get_config(self):
        return super(SpatialAttentionLayer, self).get_config()

# Load Model
model = None
try:
    if os.path.exists(MODEL_PATH):
        model = tf.keras.models.load_model(
            MODEL_PATH, 
            custom_objects={'SpatialAttentionLayer': SpatialAttentionLayer}
        )
        print("Model loaded successfully!")
    else:
        print(f"Model file not found at {MODEL_PATH}")
except Exception as e:
    print(f"Warning: Model could not be loaded. {e}")

@app.get("/")
def home():
    return {"status": "running", "model": "EfficientNetV2B0", "classes": 4}

def prepare_image(img_bytes):
    img = Image.open(io.BytesIO(img_bytes)).convert("RGB")
    img = img.resize(IMG_SIZE)
    img_array = tf.keras.preprocessing.image.img_to_array(img)
    # PENTING: Normalisasi /255 dihapus karena EfficientNetV2 menanganinya secara internal
    img_array = np.expand_dims(img_array, axis=0) 
    return img_array

@app.post("/predict")
async def predict(file: UploadFile = File(...)):
    if model is None:
        raise HTTPException(status_code=500, detail="Model belum ter-load.")
        
    if not file.filename.lower().endswith(('.png', '.jpg', '.jpeg')):
        raise HTTPException(status_code=400, detail="Format file tidak didukung.")
        
    try:
        contents = await file.read()
        img_array = prepare_image(contents)
        
        # Inferensi
        pred_prod, pred_cond = model.predict(img_array, verbose=0)
        
        prod_idx = int(np.argmax(pred_prod[0]))
        cond_idx = int(np.argmax(pred_cond[0]))
        
        product = idx_to_product.get(prod_idx, "Unknown")
        condition = idx_to_condition.get(cond_idx, "others")
        
        product_confidence = float(np.max(pred_prod[0]))
        condition_confidence = float(np.max(pred_cond[0]))

        # 4. LOGIKA FILTER 'OTHERS' (Bukan Buah)
        if product == "Others" or condition == "others" or product_confidence < 0.50:
            return {
                "prediction": {
                    "product": "Tidak Dikenali",
                    "condition": "Unknown",
                    "suggestion": "Objek bukan buah target. Mohon foto apel, jeruk, atau pisang."
                },
                "confidence": {
                    "product_confidence": product_confidence,
                    "condition_confidence": 0.0
                },
                "freshness_score": 0.0
            }

        # 5. KALKULASI FRESHNESS SCORE (Untuk Buah Target)
        if condition == "unripe":
            verdict = "Mentah"
            freshness_score = 100
        elif condition == "ripe":
            verdict = "Matang/Segar"
            freshness_score = 65 + (condition_confidence * 35)
        elif condition == "rotten":
            verdict = "Busuk"
            freshness_score = 50 - (condition_confidence * 25)
        else:
            verdict = "Unknown"
            freshness_score = 0.0
            
        return {
            "prediction": {
                "product": product,
                "condition": condition,
                "suggestion": verdict
            },
            "confidence": {
                "product_confidence": product_confidence,
                "condition_confidence": condition_confidence
            },
            "freshness_score": round(max(0, min(100, freshness_score)), 2)
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
