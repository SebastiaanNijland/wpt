// META: title=Blob Delete Object Store
// META: script=support.js

let key = "blob key";

indexeddb_test(
    function upgrade(t, db) {
      store0 = db.createObjectStore('store0');
      store1 = db.createObjectStore('store1');

      blobAContent = "First blob content";
      blobA = new Blob([blobAContent], {"type" : "text/plain"});

      store0.put(blobA, key);
    },
    function success(t, db) {
      db.close();
      var request = indexedDB.open(db.name, 2);

      request.onupgradeneeded = t.step_func(function(e) {
        db = e.target.result;
        db.deleteObjectStore('store0');

        request.onsuccess = t.step_func(function() {
          blobBContent = "Second blob content";
          trans = db.transaction('store1', 'readwrite');
          store1 = trans.objectStore('store1');
          blobB = new Blob([blobBContent], {"type" : "text/plain"});
          store1.put(blobB, key);

          trans.oncomplete = t.step_func(function() {
            db.close();
            var delete_request = indexedDB.deleteDatabase(db.name);

            // The test passes if it successfully completes.
            delete_request.onsuccess = t.step_func_done();

            delete_request.onerror = t.unreached_func("Request should not fail.");
          });

          trans.onabort = t.unreached_func("Transaction should not be aborted.");
        });
      });
      request.onsuccess = t.unreached_func("Request should not succeed without an upgrade.");
      request.onerror = t.unreached_func("Request should not fail.");
      request.onblocked = t.unreached_func("Request should not be blocked.");
    }, "Deleting an object store and a database containing blobs doesn't crash.");
