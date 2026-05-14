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
MODEL_PATH = "fruit_model.keras" # atau path yang absolut ke model Anda
IMG_SIZE = (224, 224)


# Mapping label - Sesuaikan dictionary ini dengan LabelEncoder aktual di dataset
idx_to_product = {0: "Apple", 1: "Banana", 2: "Orange"} 
idx_to_condition = {0: "ripe", 1: "rotten", 2: "unripe"} 

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
        model = tf.keras.models.load_model(MODEL_PATH, custom_objects={'SpatialAttentionLayer': SpatialAttentionLayer})
        print("Model loaded successfully!")
    else:
        print(f"Model file not found at {MODEL_PATH}")
except Exception as e:
    print(f"Warning: Model could not limit be loaded. {e}")

@app.head("/")
@app.get("/")
def home():
    return {"message": "Fruit Freshness ML API Is Running!"}

def prepare_image(img_bytes):
    img = Image.open(io.BytesIO(img_bytes)).convert("RGB")
    img = img.resize(IMG_SIZE)
    img_array = tf.keras.preprocessing.image.img_to_array(img) / 255.0
    img_array = np.expand_dims(img_array, axis=0) # shape: (1, 224, 224, 3)
    return img_array

@app.post("/predict")
async def predict(file: UploadFile = File(...)):
    if model is None:
        raise HTTPException(status_code=500, detail="Model belum tersedia. Pastikan 'fruit_model.keras' ada dan di-load dengan benar.")
        
    if not file.filename.lower().endswith(('.png', '.jpg', '.jpeg')):
        raise HTTPException(status_code=400, detail="Hanya mendukung file .png, .jpg, atau .jpeg")
        
    try:
        # Read the uploaded image
        contents = await file.read()
        img_array = prepare_image(contents)
        
        # Lakukan inferensi (model mengembalikan list of outputs)
        pred_prod, pred_cond = model.predict(img_array)
        
        # Ambil confidence tertinggi untuk klasifikasi produk
        product_confidence = float(max(pred_prod[0]))
        
        # Penanganan Gambar Sembarang (Out-of-Distribution)
        # Model Softmax akan selalu menghasilkan total probabilitas 1.0 (100%)
        # Untuk gambar sembarang, probabilitas biasanya tersebar merata (misal 33%, 33%, 34%)
        # Jika confidence tertinggi di bawah threshold (misal 65%), kita tolak gambarnya
        if product_confidence < 0.65:
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
            
        # Jika lolos threshold, ambil index dengan confidence tertinggi
        prod_idx = int(np.argmax(pred_prod))
        cond_idx = int(np.argmax(pred_cond))
        
        # Translate dari index ke tulisan label
        product = idx_to_product.get(prod_idx, f"Product-{prod_idx}")
        condition = idx_to_condition.get(cond_idx, f"Condition-{cond_idx}")
        
        # Kalkulasi Suggestion Verdict dan Freshness Score berdasarkan gambar
        confidence_cond = float(max(pred_cond[0]))
        
        if condition == "unripe":
            verdict = "Mentah"
            freshness_score = 65 + (confidence_cond * 0.35)
        elif condition == "ripe":
            verdict = "Matang"
            freshness_score = 65 + (confidence_cond * 0.35)
        elif condition == "rotten":
            verdict = "Busuk"
            # Skor tidak akan 0 (minimal 25%). Semakin yakin model itu busuk, skornya semakin turun.
            freshness_score = 50 - (confidence_cond * 0.25)
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
                "condition_confidence": confidence_cond
            },
            "freshness_score": round(freshness_score, 2)
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
