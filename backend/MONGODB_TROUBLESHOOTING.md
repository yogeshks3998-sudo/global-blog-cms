# MongoDB Atlas Connection Troubleshooting

The error below means Node cannot resolve the Atlas SRV DNS record:

```text
querySrv ECONNREFUSED _mongodb._tcp.cluster0.nfqinas.mongodb.net
```

This happens before login/password authentication.

## Fix

1. Open MongoDB Atlas.
2. Go to `Database` > your cluster > `Connect` > `Drivers`.
3. Copy the latest connection string.
4. If your network blocks SRV DNS records, choose the standard connection string option, sometimes shown as `I cannot use DNS seedlist`, and use the `mongodb://host1,host2,host3/...` format instead of `mongodb+srv://...`.
5. Put that full URI in `backend/.env` as `MONGO_URI`.
6. Make sure Atlas `Network Access` allows your current IP address.

The backend already reads only `MONGO_URI`, so no code change is needed after replacing the value.
