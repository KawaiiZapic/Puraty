import { ComicSource } from "@/venera-lib/Source";
import assert from "../assert";

class TestSource extends ComicSource {
  key = "test_source";
};

assert.ok(
  "Create TestSource",
  () => {
    return new TestSource();
  }
);

assert.ok(
  "try initialize source data db",
  async () => {
    const source = new TestSource();
    source.loadData("key0");

    const f = await tjs.open("./comic_source_data.db", "r");
    return f.readable;
  }
);

const write_data = "This is my secret data";
const write_data_update = "This is my super secret data";
const write_data_key = "test_key";

assert.ok(
  "write data to key",
  async () => {
    const source = new TestSource();
    source.saveData(write_data_key, write_data);
    return true;
  }
);


assert.eq(
  "read data by key",
  async () => {
    const source = new TestSource();
    return source.loadData(write_data_key);
  },
  write_data
);

assert.eq(
  "update data by key",
  async () => {
    const source = new TestSource();
    source.saveData(write_data_key, write_data_update);
    return source.loadData(write_data_key);
  },
  write_data_update
);

const write_data_2 = "This is my secret data for source 2";
class TestSource2 extends ComicSource {
  key = "test_source_2"
}

assert.eq(
  "should not load another comic source data with same key",
  async () => {
    const source = new TestSource2();
    return source.loadData(write_data_key);
  },
  undefined
);

assert.eq(
  "save data for another comic source",
  async () => {
    const source = new TestSource2();
    source.saveData(write_data_key, write_data_2);
    return source.loadData(write_data_key);
  },
  write_data_2
);

assert.eq(
  "delete data by key",
  () => {
    const source = new TestSource();
    source.deleteData(write_data_key);
    return source.loadData(write_data_key);
  },
  undefined
);
