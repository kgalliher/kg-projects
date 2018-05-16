using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using ESRI.ArcGIS.Geodatabase;
using ESRI.ArcGIS.Geometry;

namespace GeodatabaseModel
{
    class Index
    {

        public static void RebuildSpatialIndex(IFeatureClass featureClass)
        {
            try
            {
                Console.WriteLine("Rebuliding Spatial Index on " + featureClass.ShapeFieldName);
                IObjectClass2 featureObject = featureClass as IObjectClass2;
                ISpatialIndex si = featureClass as ISpatialIndex;

                featureObject.RebuildSpatialIndex(si as IIndex);
                Console.WriteLine("Finished rebuilding spatial index");
            }
            catch (Exception ex)
            {
                Console.WriteLine(ex.Message);
            }
        }

        public static void CreateSpatialIndex(IFeatureClass featureClass)
        {
            IIndex newIndex = new IndexClass();
            IIndexEdit newIndexEdit = (IIndexEdit) newIndex;
            newIndexEdit.Name_2 = String.Concat(featureClass.ShapeFieldName, "_idx");

        }

    }
}
