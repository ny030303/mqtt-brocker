FROM python:3.9-slim

WORKDIR /app

# 필요한 의존성 파일 복사 및 패키지 설치
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# 소스코드 복사
COPY . .

CMD ["python", "upload_to_nft_storage.py"]
