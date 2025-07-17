FROM python:3.11-slim

# Install necessary system dependencies
RUN apt-get update && \
    apt-get install -y tesseract-ocr poppler-utils && \
    apt-get clean

# Set workdir and copy app files
WORKDIR /app
COPY . /app

# Install Python requirements
RUN pip install --upgrade pip && \
    pip install -r requirements.txt

CMD ["python", "app.py"]
