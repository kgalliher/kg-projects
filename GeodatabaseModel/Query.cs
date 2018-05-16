using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using ESRI.ArcGIS.Carto;
using ESRI.ArcGIS.esriSystem;
using ESRI.ArcGIS.Geodatabase;
using ESRI.ArcGIS.Geometry;

namespace GeodatabaseModel
{
    class Query
    {
        public static void GetColDef(IWorkspace workspace, string tableName)
        {
            try
            {
                Console.WriteLine("gdb_geomattr_data is hidden!");
                
            }
            catch (Exception ex)
            {
                Console.WriteLine(ex.Message);
            }
            
        }

        public static void QueryStandaloneTable(ITable table, string searchField)
        {
            //IQueryFilter queryFilter = new QueryFilterClass();
            //queryFilter.WhereClause = "OBJECTID > 0";
            try
            {
                ICursor cursor = table.Search(null, false);
                
                IRow row = cursor.NextRow();

                while (row != null)
                {
                    Console.WriteLine(row.Value[cursor.FindField(searchField)]);
                    row = cursor.NextRow();
                }
                Console.WriteLine("Row count: {0}", table.RowCount(null).ToString());
            }
            catch (Exception ex)
            {
                Console.WriteLine(ex.Message);
            }
        }

        public static void QueryFeatureClass(IFeatureClass featureClass)
        {
            int count = 0;
            ISelectionSet2 selectionSet = null;
            IQueryFilter queryFilter = new QueryFilterClass();
            queryFilter.WhereClause = "OBJECTID < 5";

            IFeatureSelection featureSelection = (IFeatureSelection) featureClass.Search(queryFilter, false);
            selectionSet = featureSelection.SelectionSet as ISelectionSet2;
            IFeature feature = null;
            object missingType = Type.Missing;

            IGeoDataset geoDataset = featureClass as IGeoDataset;

            ICursor cursor = null;
            selectionSet.Search(null, true, out cursor);
            IFeatureCursor featureCursor = cursor as IFeatureCursor;

            IGeometryBag geometryBag = new GeometryBagClass();
            geometryBag.SpatialReference = geoDataset.SpatialReference;
            IGeometryCollection geometryCollection = geometryBag as IGeometryCollection;
            while ((feature = cursor.NextRow() as IFeature) != null)
            {
                geometryCollection.AddGeometry(feature.Shape, missingType, missingType);
                count++;
                Console.WriteLine(String.Format("Feature {0} = {1}"), count, feature.OID.ToString());
            }
        }

        //public static void QueryFeatureClassCoords(IFeatureClass featureClass)
        //{
        //    IQueryFilter qf = new QueryFilterClass();
        //    qf.WhereClause = "OBJECTID < 5";
        //    IFeatureCursor fc = featureClass.Search(qf, true);
        //    IFeature feature = fc.NextFeature();
        //    double x;
        //    double y;

        //    while (feature != null)
        //    {
        //        IPoint pt = feature.Shape as IPoint;
                
        //        IGeometry geom = pt.QueryCoords(out x, out y) as IGeometry;
        //        if (pt != null)
        //        {
        //            Console.WriteLine(pt.X + " : " + pt.Y);
        //        }
        //        feature = fc.NextFeature();
        //    }
        //}

        public static void QueryWithFilter(IFeatureClass featureClass)
        {
            int idx = featureClass.FindField(featureClass.ShapeFieldName);

            IField shapeField = featureClass.Fields.Field[idx];
            ISpatialReference sr = shapeField.GeometryDef.SpatialReference;

            ISpatialFilter spatialFilter = new SpatialFilterClass();

            IEnvelope envelope = new EnvelopeClass();
            envelope.PutCoords(90,30,91,31);
            envelope.Project(sr);

            IEnvelope envelope2 = new EnvelopeClass();
            envelope2.PutCoords(90, 30, 91, 31);
            envelope2.Project(sr);

            IGeometryCollection geomCollection = new GeometryBagClass();
            IGeometry geom = envelope as IGeometry;
            geom.Project(sr);
            geomCollection.AddGeometry((geom));

            IGeometry geom2 = envelope2 as IGeometry;
            geom2.Project(sr);
            geomCollection.AddGeometry(geom2);

            IGeometry geomFinal = geomCollection as IGeometry;

            IFields fields = featureClass.Fields;
            IField field = null;
            string subfields = "";

            spatialFilter.Geometry = geomFinal;
            spatialFilter.GeometryField = featureClass.ShapeFieldName;
            spatialFilter.SpatialRel = esriSpatialRelEnum.esriSpatialRelIntersects;

            IQueryFilter queryFilter = spatialFilter as IQueryFilter;

            ITable table;
            table = featureClass as ITable;

            ISelectionSet selectionSet = table.Select(queryFilter, esriSelectionType.esriSelectionTypeHybrid,
                esriSelectionOption.esriSelectionOptionNormal, null);

            ICursor cursor = table.Search(queryFilter, true);
            Console.WriteLine("Cursor is currently empty");

            IRow row = cursor.NextRow();

            int rowCount = table.RowCount(queryFilter);
            Console.WriteLine("Current row count: " + rowCount);

        }
    }
}
