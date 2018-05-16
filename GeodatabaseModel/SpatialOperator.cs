using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using ESRI.ArcGIS.esriSystem;
using ESRI.ArcGIS.Geodatabase;
using ESRI.ArcGIS.Geometry;
using System.Runtime.InteropServices;

namespace GeodatabaseModel
{
    class SpatialOperator
    {
        /// <summary>
        /// Conpare geometry - from online sample
        /// </summary>
        /// <param name="featureClass"></param>
        public static void CompareGeometry(IFeatureClass featureClass)
        {
            using (ESRI.ArcGIS.ADF.ComReleaser comReleaser = new ESRI.ArcGIS.ADF.ComReleaser())
            {
                IFeatureCursor featureCursor = featureClass.Search(null, false); //do not recycle the feature
                comReleaser.ManageLifetime(featureCursor);

                IFeature feature1 = featureCursor.NextFeature();
                IFeature feature2 = featureCursor.NextFeature();
                Console.WriteLine("Comparing the geometries of {0} and {1}", feature1.OID, feature2.OID);
                IRelationalOperator relOperator = feature1.Shape as IRelationalOperator;
                bool geometriesEqual = relOperator.Equals(feature2.Shape);
                Console.WriteLine("Geometries are equal: {0}", geometriesEqual);
            }
        }


    }
}
