import os
import sys
import requests
import subprocess

PINATA_JWT = os.environ.get("PINATA_JWT")
FILE_PATH = os.environ.get("FILE_PATH")

if not FILE_PATH or not os.path.isfile(FILE_PATH):
    print(f"❌ 파일 경로가 올바르지 않거나 존재하지 않습니다: {FILE_PATH}")
    sys.exit(1)

headers = {
    "Authorization": f"Bearer {PINATA_JWT}"
}

def upload_to_pinata(file_path):
    print("📡 Pinata로 업로드 중...")
    with open(file_path, 'rb') as f:
        files = {
            'file': (os.path.basename(file_path), f)
        }
        response = requests.post(
            "https://api.pinata.cloud/pinning/pinFileToIPFS",
            headers=headers,
            files=files
        )

    if response.status_code == 200:
        cid = response.json()["IpfsHash"]
        print(f"✅ Pinata 업로드 완료! CID: {cid}")
        print(f"🔗 https://gateway.pinata.cloud/ipfs/{cid}")
        return cid
    else:
        print("❌ Pinata 업로드 실패")
        print(response.text)
        return None


def upload_to_local_ipfs_via_api(file_path):
    print("🧩 로컬 IPFS 노드 (API)로 업로드 중...")
    with open(file_path, "rb") as f:
        response = requests.post(
            "http://ipfs:5001/api/v0/add",
            files={"file": f}
        )
    if response.status_code == 200:
        cid = response.json()["Hash"]
        print(f"✅ 로컬 IPFS 업로드 완료! CID: {cid}")
        return cid
    else:
        print("❌ 로컬 IPFS 업로드 실패")
        print(response.text)
        return None


def pin_local_ipfs_via_api(cid):
    print(f"📌 로컬 IPFS 노드에 핀 고정 중... CID: {cid}")
    response = requests.post(
        f"http://ipfs:5001/api/v0/pin/add?arg={cid}"
    )
    if response.status_code == 200:
        print("✅ 핀 고정 완료")
    else:
        print("❌ 핀 고정 실패")
        print(response.text)

if __name__ == "__main__":
    pinata_cid = upload_to_pinata(FILE_PATH)
    local_cid = upload_to_local_ipfs_via_api(FILE_PATH)

    if local_cid:
        pin_local_ipfs_via_api(local_cid)

