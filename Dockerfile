# ==============================================================================
# Multi-Stage Dockerfile untuk Zelatan Cell (React + Spring Boot + Supabase)
# Sesuai arsitektur Single-Origin (Aturan 8 CLAUDE.md)
# ==============================================================================

# ------------------------------------------------------------------------------
# Stage 1: Build Frontend (Vite + React)
# ------------------------------------------------------------------------------
FROM node:20-alpine AS frontend-builder
WORKDIR /app/frontend

# Cache npm dependencies
COPY frontend/package.json frontend/package-lock.json ./
RUN npm ci

# Copy source code dan build
COPY frontend/ ./
RUN npm run build

# ------------------------------------------------------------------------------
# Stage 2: Build Backend JAR (Maven + Java 21)
# ------------------------------------------------------------------------------
FROM maven:3.9.9-eclipse-temurin-21-alpine AS backend-builder
WORKDIR /app/backend

# Cache dependensi Maven
COPY backend/pom.xml ./
RUN mvn dependency:go-offline -B

# Copy source code backend
COPY backend/src ./src

# Salin hasil build React ke folder static Spring Boot
# (Aset gambar statis seperti static/img/* tetap dipertahankan)
COPY --from=frontend-builder /app/frontend/dist/ ./src/main/resources/static/

# Package JAR tunggal (skip unit tests saat container build)
RUN mvn clean package -DskipTests -B

# ------------------------------------------------------------------------------
# Stage 3: Production Runtime (Eclipse Temurin JRE 21 Alpine)
# ------------------------------------------------------------------------------
FROM eclipse-temurin:21-jre-alpine AS runner

# Pasang timezone data (WIB / Asia/Jakarta) dan fontconfig (diperlukan OpenPDF SKPL-F16)
RUN apk add --no-cache tzdata fontconfig ttf-dejavu && \
    cp /usr/share/zoneinfo/Asia/Jakarta /etc/localtime && \
    echo "Asia/Jakarta" > /etc/timezone

# Buat non-root user untuk keamanan container
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

WORKDIR /app

# Ambil artifact JAR dari builder
COPY --from=backend-builder /app/backend/target/*.jar /app/app.jar
RUN chown -R appuser:appgroup /app

USER appuser

EXPOSE 8080

# Pengaturan JVM yang hemat RAM namun responsif untuk VPS
ENV JAVA_OPTS="-Xms256m -Xmx512m -XX:+UseG1GC"

ENTRYPOINT ["sh", "-c", "exec java $JAVA_OPTS -jar /app/app.jar"]
