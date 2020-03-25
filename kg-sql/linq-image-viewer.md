
### Some linq script I once wrote to pull images from a database
#### LinqPad5

```
var entity = SDE_blk_1s.Where(ent => ent.Rasterband_id > 0).ToArray();
int num = 0;

Debug.WriteLine(entity.Count());

foreach(var item in entity)
{
	num += 1;
	using (var ms = new MemoryStream(item.Block_data.ToArray()))
	{
		FileStream file = new FileStream(@"C:\share\stormDrainPics\db_image" + num + ".jpg", FileMode.Create, System.IO.FileAccess.Write);
		byte[] bytes = new byte[ms.Length];
		ms.Read(bytes, 0, (int)ms.Length);
		file.Write(bytes, 0, bytes.Length);
	}
}
```
