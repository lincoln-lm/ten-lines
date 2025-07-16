"""Restore mtimes for PokeFinder generated files (if they aren't modified)"""

import glob
import os
import sys
import hashlib
import json

if __name__ == "__main__":
    if os.path.exists(sys.argv[1] + "/mtimes.json"):
        with open(sys.argv[1] + "/mtimes.json", "r", encoding="utf-8") as f:
            mtimes = json.load(f)

        for key, value in mtimes.items():
            print(f"mtime for {key}: {value}")

        for header in glob.glob(
            sys.argv[1] + "/lib/PokeFinder/Source/Core/Resources/*.hpp"
        ):
            with open(header, "rb") as f:
                file_hash = hashlib.sha256(f.read()).hexdigest()
            if file_hash in mtimes:
                print(f"Restoring {header} {file_hash}")
                os.utime(header, (mtimes[file_hash], mtimes[file_hash]))
            else:
                print(f"Not restoring {header} {file_hash}")

        os.remove(sys.argv[1] + "/mtimes.json")
