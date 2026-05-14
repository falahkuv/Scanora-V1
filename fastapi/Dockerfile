# Menggunakan base image python 3.10
FROM python:3.10

# Bikin user khusus sesuai syarat Hugging Face (wajib jalan di user 1000)
RUN useradd -m -u 1000 user
USER user
ENV PATH="/home/user/.local/bin:$PATH"

# Set working directory
WORKDIR /app

# Copy requirements dan install dependencies
COPY --chown=user ./requirements.txt requirements.txt
RUN pip install --no-cache-dir --upgrade -r requirements.txt

# Copy semua file ke dalam container
COPY --chown=user . /app

# Perintah untuk menjalankan FastAPI di port 7860
CMD ["uvicorn", "api_main:app", "--host", "0.0.0.0", "--port", "7860"]
