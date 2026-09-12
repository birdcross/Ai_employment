import json
import os
from pathlib import Path

from fastapi import FastAPI, HTTPException
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles


# =========================================================
# FastAPI 설정
# =========================================================
app = FastAPI(
    title="JobFit AI",
    description="AI 기반 채용공고 추천 서비스",
    version="1.0.0"
)


# =========================================================
# 프로젝트 최상위 경로
#
# employment_com/
# ├─ index.html
# ├─ jobs.html
# ├─ job-detail.html
# ├─ match.html
# ├─ mypage.html
# ├─ css/
# ├─ js/
# └─ api/
#    └─ index.py
# =========================================================
BASE_DIR = Path(__file__).resolve().parent.parent


# =========================================================
# CSS / JS 정적 파일 연결
# =========================================================
app.mount(
    "/css",
    StaticFiles(directory=str(BASE_DIR / "css")),
    name="css"
)

app.mount(
    "/js",
    StaticFiles(directory=str(BASE_DIR / "js")),
    name="js"
)


# =========================================================
# 웹페이지
# =========================================================
# HOME
@app.get("/", include_in_schema=False)
@app.get("/index.html", include_in_schema=False)
def index_page():
    return FileResponse(str(BASE_DIR / "index.html"))


# JOBS
@app.get("/jobs.html", include_in_schema=False)
def jobs_page():
    return FileResponse(str(BASE_DIR / "jobs.html"))


# 상세
@app.get("/job-detail.html", include_in_schema=False)
def job_detail_page():
    return FileResponse(str(BASE_DIR / "job-detail.html"))


# AI MATCH
@app.get("/match.html", include_in_schema=False)
def match_page():
    return FileResponse(str(BASE_DIR / "match.html"))


# MY PAGE
@app.get("/mypage.html", include_in_schema=False)
def mypage_page():
    return FileResponse(str(BASE_DIR / "mypage.html"))
# =========================================================
# API
# =========================================================

@app.get("/api")
def api_home():
    return {
        "status": "ok",
        "message": "JobFit AI API is running"
    }


@app.get("/api/health")
def health():
    return {
        "status": "ok"
    }


# =========================================================
# AI 채용공고 추천
# =========================================================
@app.post("/api/recommend")
def recommend(payload: dict):

    # 사용자 정보
    profile = payload.get("profile") or {}

    # 채용공고 목록
    jobs = payload.get("jobs") or []

    # -----------------------------------------------------
    # 필수 입력값 검사
    # -----------------------------------------------------
    required_fields = [
        "desired_role",
        "career",
        "desired_location",
        "skills"
    ]

    for field in required_fields:

        value = str(profile.get(field, "")).strip()

        if not value:
            raise HTTPException(
                status_code=400,
                detail="필수 스펙 정보가 누락되었습니다."
            )

    # 채용공고가 없는 경우
    if not jobs:
        raise HTTPException(
            status_code=400,
            detail="분석할 채용공고가 없습니다."
        )

    # -----------------------------------------------------
    # OpenAI API KEY 확인
    # -----------------------------------------------------
    api_key = os.getenv("OPENAI_API_KEY")

    if not api_key:
        raise HTTPException(
            status_code=500,
            detail="OPENAI_API_KEY 환경 변수가 설정되지 않았습니다."
        )

    # -----------------------------------------------------
    # AI에 전달할 채용공고 데이터 정리
    # -----------------------------------------------------
    compact_jobs = []

    for job in jobs[:20]:

        compact_jobs.append(
            {
                "id": job.get("id"),
                "company": job.get("company", ""),
                "title": job.get("title", ""),
                "location": job.get("location", ""),
                "career": job.get("career", ""),
                "category": job.get("category", ""),
                "skills": job.get("skills", []),
                "requirements": job.get("requirements", []),
                "preferred": job.get("preferred", [])
            }
        )

    # -----------------------------------------------------
    # AI Prompt
    # -----------------------------------------------------
    prompt = f"""
당신은 취업 컨설턴트입니다.

사용자의 취업 희망 조건과 채용공고를 비교하여
가장 적합한 채용공고 TOP 3를 추천해주세요.

반드시 제공된 채용공고 안에서만 선택하세요.

사용자 정보:

희망 직무:
{profile.get("desired_role")}

경력:
{profile.get("career")}

희망 지역:
{profile.get("desired_location")}

보유 기술:
{profile.get("skills")}


채용공고 목록:

{json.dumps(compact_jobs, ensure_ascii=False, indent=2)}


다음 JSON 형식으로만 응답하세요.

{{
    "recommendations": [
        {{
            "job_id": 1,
            "company": "회사명",
            "title": "채용공고명",
            "score": 95,
            "reasons": [
                "추천 이유 1",
                "추천 이유 2"
            ],
            "strengths": [
                "사용자의 강점 1",
                "사용자의 강점 2"
            ],
            "gaps": [
                "보완할 부분 1"
            ]
        }}
    ]
}}

recommendations는 정확히 3개를 반환하세요.
score는 0~100점으로 작성하세요.
"""

    # -----------------------------------------------------
    # OpenAI 호출
    # -----------------------------------------------------
    try:

        from openai import OpenAI

        client = OpenAI(api_key=api_key)

        response = client.responses.create(
            model="gpt-5.6-luna",
            input=prompt
        )

        text = response.output_text.strip()

        # ```json 제거
        if text.startswith("```json"):
            text = text[7:]

        elif text.startswith("```"):
            text = text[3:]

        if text.endswith("```"):
            text = text[:-3]

        text = text.strip()

        # JSON 변환
        result = json.loads(text)

        recommendations = result.get("recommendations", [])

        # 추천 결과 없는 경우
        if not recommendations:
            raise HTTPException(
                status_code=500,
                detail="AI 추천 결과가 없습니다."
            )

        return {
            "recommendations": recommendations
        }


    except json.JSONDecodeError:

        raise HTTPException(
            status_code=500,
            detail="AI 응답을 JSON으로 변환하지 못했습니다."
        )


    except HTTPException:
        raise


    except Exception as e:

        print("OpenAI ERROR:", str(e))

        raise HTTPException(
            status_code=500,
            detail=f"AI 추천 처리 중 오류가 발생했습니다: {str(e)}"
        )