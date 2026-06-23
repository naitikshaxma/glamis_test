from app.config.settings import get_settings
import pymongo
from bson import ObjectId

def test():
    settings = get_settings()
    print("MONGODB_URL from settings:", settings.mongodb_url)
    
    if not settings.mongodb_url:
        print("MONGODB_URL is None!")
        return
        
    parsed = pymongo.uri_parser.parse_uri(settings.mongodb_url)
    db_name = parsed.get("database") or "glamis"
    print("Parsed database name:", db_name)
    
    client = pymongo.MongoClient(settings.mongodb_url)
    db = client[db_name]
    print("Collections in MongoDB:", db.list_collection_names())
    
    user = db["users"].find_one()
    print("Sample user from PyMongo:", user)

if __name__ == "__main__":
    test()
