using System;
using System.Collections.Generic;
using System.Linq;
using System.Data.Linq;
using System.Text;
using System.Threading.Tasks;

namespace GeodatabaseModel
{
    class LinqToSQL
    {
        static DataContext db = new DataContext(@"Database=sde1051;Server=KENG\SQL2016;Integrated Security=SSPI");

        public static void CheckConnection()
        {
            bool exists = db.DatabaseExists();
            Console.WriteLine(exists);
        }
    }
}
