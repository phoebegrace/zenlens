FROM node:22-bookworm-slim AS client
WORKDIR /build
COPY src/client/package*.json ./
RUN npm ci --no-audit --no-fund
COPY src/client/ ./
RUN GENERATE_SOURCEMAP=false CI=false npm run build

FROM python:3.12-slim-bookworm
ENV PYTHONUNBUFFERED=1 TF_CPP_MIN_LOG_LEVEL=3 TF_NUM_INTRAOP_THREADS=1 TF_NUM_INTEROP_THREADS=1 DATA_ROOT=/data
RUN apt-get update && apt-get install -y --no-install-recommends libgl1 libglib2.0-0 libgomp1 && rm -rf /var/lib/apt/lists/*
WORKDIR /app
COPY src/server/requirements.txt ./requirements.txt
RUN pip install --no-cache-dir -r requirements.txt
COPY src/server/ ./server/
COPY --from=client /build/build ./client/build
# Fetch detector weights during build instead of the first user's analysis.
RUN python -c "from retinaface import RetinaFace; RetinaFace.build_model()"
WORKDIR /app/server
RUN python -c "from services.model_loader import get_model; get_model()"
EXPOSE 8080
CMD ["sh", "-c", "exec gunicorn 'app:create_app()' --bind 0.0.0.0:${PORT:-8080} --workers 1 --threads 2 --timeout 600 --access-logfile -"]
