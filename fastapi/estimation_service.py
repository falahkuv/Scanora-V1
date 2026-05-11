from datetime import datetime, timedelta

def get_estimation_for_storage(product: str, condition: str, storage: str):
    max_days = 0
    date_type = "-"
    
    if condition == "rotten":
        max_days = 0
        date_type = "Sudah Busuk"
    elif product == "Banana":
        if condition == "unripe":
            max_days = 5 if storage == "suhu_ruang" else 0
            date_type = "Estimasi Matang" if storage == "suhu_ruang" else "Tidak Disarankan di Kulkas"
        elif condition == "ripe":
            max_days = 2 if storage == "suhu_ruang" else 7
            date_type = "Batas Konsumsi"
    elif product == "Apple":
        if condition == "unripe":
            max_days = 3 if storage == "suhu_ruang" else 30
            date_type = "Estimasi Matang"
        elif condition == "ripe":
            max_days = 5 if storage == "suhu_ruang" else 30
            date_type = "Batas Konsumsi"
    elif product == "Orange":
        if condition == "unripe":
            max_days = 7 if storage == "suhu_ruang" else 30
            date_type = "Estimasi Matang"
        elif condition == "ripe":
            max_days = 14 if storage == "suhu_ruang" else 30
            date_type = "Batas Konsumsi"

    estimated_date_str = "-"
    if max_days > 0:
        est_date = datetime.now() + timedelta(days=max_days)
        estimated_date_str = est_date.strftime("%Y-%m-%d")

    return {
        "max_days": max_days,
        "estimated_date": estimated_date_str,
        "date_type": date_type
    }

def get_all_estimations(product: str, condition: str):
    return {
        "suhu_ruang": get_estimation_for_storage(product, condition, "suhu_ruang"),
        "kulkas": get_estimation_for_storage(product, condition, "kulkas")
    }