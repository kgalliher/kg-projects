# 📢 Beta Release – ArcGIS Rust v0.x.xb0

We’re excited to announce the **beta release** of **`arcgis_geometry`**,  
a Python package that simplifies and improves the performance of geometry conversions and spatial operations in the ArcGIS API for Python.

---

## 🚀 What's New
**Version:** `0.x.xb0`  
**Status:** Beta – features are mostly complete, but we’re still refining and fixing bugs.

### Key Features
- Simplified spatial operation interfaces
- Improved performance and reduced overhead of spatial operations and geometry conversions

---

## 📦 Installation
```bash
pip install arcgis_rust --pre

The --pre flag ensures pip installs pre-release versions.

```

🧪 Quick Start
```python
from arcgis_geometry import Geometry

# Example usage
my_point = {
            "x": -9159430.78506556,
            "y": 4224257.59908715,
            "spatialReference": {"wkid": 102100, "latestWkid": 3857},
        }
point_geom = Geometry(my_point)
result = point_geom.buffer(distance=100)
print(result)

>>> <Polygon at 0x14037f2cd50>
```

💬 Feedback Wanted
We’d love your feedback to make this package stable and production-ready.

🐛 Report bugs: GitHub Issues
💡 Suggest features or improvements
📚 Share your use cases


⚠️ Beta Disclaimer
This is a beta release. APIs may change before the stable version.
Use in production at your own risk.

Thank you for helping us improve <YourPackageName>!
— The ArcGIS Python API Team

