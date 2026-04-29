from fastapi import FastAPI, File, UploadFile, HTTPException
import tensorflow as tf
import numpy as np
import io
from PIL import Image
import uvicorn
import os

app = FastAPI(title="Fruit Freshness API", description="API untuk mendeteksi tipe dan kesegaran buah")

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODEL_PATH = os.path.join(BASE_DIR, "fruit_model.keras")
IMG_SIZE = (224, 224)

condition_score_map = {
    "unripe": 0.5,
    "ripe": 1.0,
    "rotten": 0.0
}

idx_to_product = {0: "Apple", 1: "Banana", 2: "Orange"}
idx_to_condition = {0: "ripe", 1: "rotten", 2: "unripe"}

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

model = None
try:
    if os.path.exists(MODEL_PATH):
        model = tf.keras.models.load_model(MODEL_PATH, custom_objects={"SpatialAttentionLayer": SpatialAttentionLayer})
        print("Model loaded successfully!")
    else:
        print(f"Model file not found at {MODEL_PATH}")
except Exception as e:
    print(f"Warning: Model could not be loaded. {e}")

@app.get("/")
def home():
    return {"message": "Fruit Freshness ML API Is Running!"}

def prepare_image(img_bytes):
    img = Image.open(io.BytesIO(img_bytes)).convert("RGB")
    img = img.resize(IMG_SIZE)
    img_array = tf.keras.preprocessing.image.img_to_array(img) / 255.0
    img_array = np.expand_dims(img_array, axis=0)
    return img_array

@app.post("/predict")
async def predict(file: UploadFile = File(...)):
    if model is None:
        raise HTTPException(status_code=500, detail="Model belum tersedia. Pastikan 'fruit_model.keras' ada dan di-load dengan benar.")

    if not file.filename.lower().endswith((".png", ".jpg", ".jpeg")):
        raise HTTPException(status_code=400, detail="Hanya mendukung file .png, .jpg, atau .jpeg")

    try:
        contents = await file.read()
        img_array = prepare_image(contents)

        pred_prod, pred_cond = model.predict(img_array)

        prod_idx = int(np.argmax(pred_prod))
        cond_idx = int(np.argmax(pred_cond))

        product = idx_to_product.get(prod_idx, f"Product-{prod_idx}")
        condition = idx_to_condition.get(cond_idx, f"Condition-{cond_idx}")

        confidence_cond = float(max(pred_cond[0]))
        score = condition_score_map.get(condition, 0.0)
        freshness_index = confidence_cond * score

        return {
            "prediction": {
                "product": product,
                "condition": condition
            },
            "confidence": {
                "product_confidence": float(max(pred_prod[0])),
                "condition_confidence": confidence_cond
            },
            "freshness_index": round(freshness_index, 4)
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
