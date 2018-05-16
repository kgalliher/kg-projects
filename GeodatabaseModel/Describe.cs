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
    class Describe
    {
        /// <summary>
        /// List field information
        /// </summary>
        /// <param name="table"></param>
        public static void ReportSchema(ITable table)
        {
            try
            {
                List<FldClass> fldClassList = new List<FldClass>();
                IFields2 fields = table.Fields as IFields2;

                for (int i = 0; i < fields.FieldCount; i++)
                {
                    IField2 field = fields.Field[i] as IField2;
                    FldClass fieldClassInstance = new FldClass(i + 1);

                    fieldClassInstance.AliasName = field.Name;
                    fieldClassInstance.IsNullable = field.IsNullable;
                    fieldClassInstance.IsRequired = field.Required;
                    fieldClassInstance.FieldType = field.Type;
                    fieldClassInstance.Length = field.Length;
                    fldClassList.Add(fieldClassInstance);
                }
                Console.WriteLine(string.Format("{0}\t\t{1}\t{2}\t{3}\t{4}", "Name", "Type",
                    "Length", "IsNullable", "IsRequired"));
                foreach (var fldClass in fldClassList)
                {
                    Console.WriteLine(string.Format("{0}\t\t{1}\t{2}\t{3}\t{4}", fldClass.AliasName,fldClass.FieldType,
                        fldClass.Length, fldClass.IsNullable, fldClass.IsRequired));
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine("Error: " + ex.Message);
            }
        }
    }
}
