using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using ESRI.ArcGIS.esriSystem;
using ESRI.ArcGIS.Geodatabase;
using ESRI.ArcGIS.Geometry;
using System.Runtime.InteropServices;
using ESRI.ArcGIS.ADF;

namespace GeodatabaseModel
{
    class FeatureClassCalculation
    {
        public static void CalculateAreaOfShape(IFeatureClass featureClass)
        {
            using (ComReleaser comReleaser = new ComReleaser())
            {
                IFeatureCursor featureCursor = featureClass.Search(null, true);
                comReleaser.ManageLifetime(featureCursor);

                IFeature feature = null;
                double totalShapeArea = 0;
                while ((feature = featureCursor.NextFeature()) != null)
                {
                    IArea shapeArea = feature.Shape as IArea;
                    totalShapeArea += shapeArea.Area;
                }
                
                Console.WriteLine("Total shape area: {0}", Math.Round(totalShapeArea, 3).ToString("#,##0"));
            }
        }
    }
}
