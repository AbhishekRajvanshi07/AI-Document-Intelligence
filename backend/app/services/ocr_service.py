"""
OCR Service — Tesseract LSTM + OpenCV preprocessing pipeline
"""
import cv2
import numpy as np
import pytesseract
from PIL import Image
import io
import logging
import time
from app.core.config import settings

logger = logging.getLogger(__name__)
pytesseract.pytesseract.tesseract_cmd = settings.TESSERACT_CMD


class OCRService:
    def process_bytes(self, file_bytes: bytes, lang: str = "eng") -> dict:
        """Process raw file bytes through the full OCR pipeline."""
        start = time.monotonic()
        img = self._load_from_bytes(file_bytes)
        preprocessed = self._preprocess(img)
        text, confidence = self._run_ocr(preprocessed, lang)
        elapsed_ms = int((time.monotonic() - start) * 1000)
        return {
            "text": text,
            "confidence": confidence,
            "processing_ms": elapsed_ms,
            "steps_applied": ["deskew", "denoise", "binarize", "clahe", "upsample"],
        }

    def _load_from_bytes(self, data: bytes) -> np.ndarray:
        pil_img = Image.open(io.BytesIO(data)).convert("RGB")
        return cv2.cvtColor(np.array(pil_img), cv2.COLOR_RGB2BGR)

    def _preprocess(self, img: np.ndarray) -> np.ndarray:
        img = self._deskew(img)
        img = self._denoise(img)
        img = self._binarize(img)
        img = self._apply_clahe(img)
        img = self._upsample(img)
        return img

    def _deskew(self, img: np.ndarray) -> np.ndarray:
        gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
        edges = cv2.Canny(gray, 50, 150, apertureSize=3)
        lines = cv2.HoughLines(edges, 1, np.pi / 180, 200)
        if lines is not None:
            angles = [line[0][1] for line in lines]
            angle_deg = (np.median(angles) * 180 / np.pi) - 90
            if abs(angle_deg) < 45:
                h, w = img.shape[:2]
                M = cv2.getRotationMatrix2D((w / 2, h / 2), angle_deg, 1.0)
                img = cv2.warpAffine(img, M, (w, h), flags=cv2.INTER_CUBIC,
                                     borderMode=cv2.BORDER_REPLICATE)
        return img

    def _denoise(self, img: np.ndarray) -> np.ndarray:
        return cv2.GaussianBlur(img, (3, 3), 0)

    def _binarize(self, img: np.ndarray) -> np.ndarray:
        gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY) if len(img.shape) == 3 else img
        _, binary = cv2.threshold(gray, 0, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU)
        return binary

    def _apply_clahe(self, img: np.ndarray) -> np.ndarray:
        if len(img.shape) == 2:
            clahe = cv2.createCLAHE(clipLimit=2.0, tileGridSize=(8, 8))
            return clahe.apply(img)
        return img

    def _upsample(self, img: np.ndarray) -> np.ndarray:
        h, w = img.shape[:2]
        if max(h, w) < 1200:
            img = cv2.resize(img, None, fx=2.0, fy=2.0, interpolation=cv2.INTER_CUBIC)
        return img

    def _run_ocr(self, img: np.ndarray, lang: str) -> tuple:
        pil_img = Image.fromarray(img)
        config = f"--oem 1 --psm 3 -l {lang}"
        text = pytesseract.image_to_string(pil_img, config=config)
        data = pytesseract.image_to_data(
            pil_img, config=config, output_type=pytesseract.Output.DICT
        )
        confs = [c for c in data["conf"] if c != -1]
        avg_conf = (sum(confs) / len(confs) / 100) if confs else 0.0
        return text.strip(), round(avg_conf, 4)


ocr_service = OCRService()
