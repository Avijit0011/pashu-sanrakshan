"""
Biologically Realistic Image Augmentation Module for Livestock Health Screening.
"""
from typing import Dict, Any

class LivestockImageAugmenter:
    """
    Applies biologically sound visual augmentations:
    - Rotation (slight angle shifts -15 to +15 deg)
    - Scaling & Cropping
    - Horizontal flip (when anatomically symmetric)
    - Brightness and contrast variation (simulating outdoors/barn lighting)
    
    Avoids unrealistic color shifts or vertical flips that destroy anatomical context.
    """

    def __init__(self, rotation_deg: float = 15.0, brightness_factor: float = 0.2):
        self.rotation_deg = rotation_deg
        self.brightness_factor = brightness_factor

    def get_augmentation_config(self) -> Dict[str, Any]:
        return {
            "rotation": f"random_range(-{self.rotation_deg}, +{self.rotation_deg})",
            "horizontal_flip": "p=0.5 (enabled for symmetric lesions)",
            "vertical_flip": "DISABLED (biologically unrealistic)",
            "brightness_shift": f"p=0.3, delta={self.brightness_factor}",
            "contrast_shift": "p=0.3, factor=(0.8, 1.2)",
            "zoom_crop": "range=(0.85, 1.0)"
        }
