/**
Using the Java.Sql package to connect to a geodatabase and insert geometry into a feature class.
*/
import java.io.*;
import java.sql.*;
import java.util.Properties; 

public class InsertSTGeometrySQL { 

	private static final String DB_DRIVER = "oracle.jdbc.driver.OracleDriver";
	private static final String DB_CONNECTION = "jdbc:oracle:thin:@server:1521:SDE102";
	private static final String DB_USER = "sde";
	private static final String DB_PASSWORD = "sde";
	
	public static void main(String[] args) throws SQLException { 
		
		try {
			insertDBRecord();
		} catch (IOException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
		
		}

	private static void insertDBRecord() throws IOException {
		Connection conn = null;
		Statement statement = null;
		double v1 = -87.8500946;
		int count = 50;
		
		//New FileWriter to open a file for appending SQL statements
		FileWriter writer = new FileWriter("D:\\Temp\\ST_GEOM_5k_Inserts.sql");
		
			try {
				System.out.println("Inserting 5000 records");
				conn = getDBConnection();
				conn.setAutoCommit(true);
				for (int i = 2; i < count; i++) {
					String sql = "INSERT INTO mlinestring VALUES(" + i + " ,sde.st_geomfromtext ('MULTILINESTRING ((-87.8500946 41.88951239, -87.85030454 41.88953591, -87.85051273 41.88956664, -87.85071886 41.88960417, -87.85092396 41.88964471, -87.85112991 41.8896827, " + (v1)++ + " 41.8896827), (-87.7291491 41.89163385, -87.72935603 41.89163265, -87.72956295 41.89163144, -87.72976988 41.89163024, -87.72997667 41.89163313, -87.73018262 41.8916473, -87.73038769 41.89166767, -87.73059375 41.89168074, -87.73080064 41.89167894, -87.73100752 41.89167565, -87.73121441 41.89167237, -87.73142129 41.89166909, -87.73162818 41.89166581, -87.73183506 41.89166253), (-88.23402294 41.88266182, -88.23420652 41.88266434, -88.23440134 41.882662, -88.23459615 41.88265965, -88.23479096 41.8826573, -88.23498577 41.88265495, -88.23518058 41.8826526, -88.23537539 41.88265026, -88.23557021 41.88264791, -88.23576502 41.88264556, -88.23595982 41.88264292, -88.23615461 41.88263957, -88.23634941 41.88263725, -88.23654425 41.88263641, -88.23673875 41.88264221, -88.23693297 41.88265364, -88.23712719 41.88266507, -88.2373214 41.8826765, -88.23751562 41.88268793, -88.23770984 41.88269936, -88.237904 41.88271126, -88.2380979 41.88272534, -88.23829168 41.88274029, -88.23848502 41.88275801, -88.23867827 41.8827763, -88.23887204 41.88279097), (-88.23402632 41.88277267, -88.23420675 41.88277467, -88.23440129 41.88277237, -88.23459583 41.88277007, -88.23479038 41.88276777, -88.23498492 41.88276547, -88.23517947 41.88276317, -88.23537401 41.88276087, -88.23556855 41.88275857, -88.2357631 41.88275627, -88.23595764 41.88275397, -88.23615218 41.88275167, -88.23634673 41.88274937, -88.23654128 41.88274915, -88.2367356 41.88275603, -88.23692971 41.88276587))', 3857))";
					statement = conn.createStatement();
					
					//Write the SQL statement to the file
					writer.append(sql + ";\n");
					
					statement.executeUpdate(sql);
					v1 += 2;
				}
				System.out.println("Done");
				
			}

			catch(SQLException e) {
				// TODO Auto-generated catch block
				e.printStackTrace();
			}
			
			finally {
				//Close the connection if the statement or connection is null.
				if (statement != null) {
					try {
						statement.close();
					} catch (SQLException e) {
						// TODO Auto-generated catch block
						e.printStackTrace();
					}
				}
	 
				if (conn != null) {
					try {
						conn.close();
					} catch (SQLException e) {
						// TODO Auto-generated catch block
						e.printStackTrace();
					}
				}
			}	
	}


	private static Connection getDBConnection() throws SQLException {
		Connection conn = null;
		
		try {
			Class.forName(DB_DRIVER);
		} catch (ClassNotFoundException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
		
		try {
			conn = DriverManager.getConnection( DB_CONNECTION, DB_USER, DB_PASSWORD); 
		}
		catch(SQLException e) {
			e.printStackTrace();
		}
		
		return conn;
	}
	
}
