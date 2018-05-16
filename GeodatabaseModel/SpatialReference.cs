using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using ESRI.ArcGIS.esriSystem;
using ESRI.ArcGIS.Geodatabase;
using ESRI.ArcGIS.Geometry;

namespace GeodatabaseModel
{
    class SpatialReference
    {
        public static ISpatialReference GetSpatialReferenceFromWkid(int wkid)
        {
            ISpatialReferenceFactory srFactory = new SpatialReferenceEnvironmentClass();
            ISpatialReference srs = srFactory.CreateGeographicCoordinateSystem(wkid);
            return srs;
        }

        public static ISpatialReference GetSpatialReferenceFromPrjFile(string pathToPrjFile)
        {
            ISpatialReferenceFactory srFactory = new SpatialReferenceEnvironmentClass();
            ISpatialReference srs = srFactory.CreateESRISpatialReferenceFromPRJFile(pathToPrjFile);
            return srs;
        }
    }
}
