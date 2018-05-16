using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using ESRI.ArcGIS.Geodatabase;

namespace GeodatabaseModel
{
    /// <summary>
    /// Simple model for a field
    /// </summary>
    class FldClass
    {
        public int No { get; set; }
        public string AliasName { get; set; }
        public string Name { get; set; }
        public bool IsNullable { get; set; }
        public esriFieldType FieldType { get; set; }

        public FldClass(int no)
        {
            this.No = no;
        }


        public bool IsRequired { get; set; }

        public int Length { get; set; }
    }


}
