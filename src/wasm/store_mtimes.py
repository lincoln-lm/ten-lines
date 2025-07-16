"""Store mtimes for PokeFinder generated files"""

import glob
import os
import sys
import hashlib
import json

if __name__ == "__main__":
    mtimes = {}

    for header in glob.glob(
        sys.argv[1] + "/lib/PokeFinder/Source/Core/Resources/*.hpp"
    ):
        with open(header, "rb") as f:
            file_hash = hashlib.sha256(f.read()).hexdigest()
        mtimes[file_hash] = os.path.getmtime(header)

    with open(sys.argv[1] + "/mtimes.json", "w+", encoding="utf-8") as f:
        json.dump(mtimes, f)
