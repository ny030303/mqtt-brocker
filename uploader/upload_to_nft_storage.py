import os
import requests

# 환경 변수에서 API 키와 업로드할 파일 경로를 불러옴
NFT_STORAGE_API_KEY = os.environ.get("NFT_STORAGE_API_KEY", "your_api_key_here")
FILE_PATH = os.environ.get("FILE_PATH", "your_file_path_here")

def upload_to_nft_storage(file_path):
    with open(file_path, "rb") as f:
        response = requests.post(
            "https://api.nft.storage/upload",
            headers={"Authorization": f"Bearer {NFT_STORAGE_API_KEY}"},
            files={"file": f}
        )

    if response.status_code == 200:
        cid = response.json()["value"]["cid"]
        print(f"✅ 업로드 완료! CID: {cid}")
        print(f"🔗 https://{cid}.ipfs.dweb.link")
        return cid
    else:
        print("❌ 업로드 실패")
        print(response.text)
        return None

if __name__ == "__main__":
    cid = upload_to_nft_storage(FILE_PATH)
