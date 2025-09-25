# 🚂 Railway Deployment Guide for SleepDiagnosis

## 🚀 Quick Deploy

### **One-Click Deploy**
[![Deploy on Railway](https://railway.app/button.svg)](https://railway.app/new/template/sleepdiagnosis)

### **Manual Deployment**

1. **Fork Repository**
   - Fork `https://github.com/akarsh-2005/sleepdiagnosis`

2. **Deploy to Railway**
   - Go to [Railway Dashboard](https://railway.app/dashboard)
   - Click "New Project"
   - Select "Deploy from GitHub repo"
   - Connect your forked repository

3. **Configuration** (Auto-detected)
   - **Framework**: Python (FastAPI)
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `uvicorn backend.main:app --host 0.0.0.0 --port $PORT`
   - **Health Check**: `/health`

4. **Deploy**
   - Railway will automatically build and deploy
   - Your app will be available at `https://your-app.up.railway.app`

## 🔧 Project Structure

```
sleepdiagnosis/
├── backend/              # FastAPI backend
│   ├── main.py          # Main application (with static file serving)
│   ├── model.py         # ML models and audio processing
│   └── requirements.txt # Python dependencies
├── index.html           # Frontend application
├── requirements.txt     # Root Python dependencies
├── railway.json         # Railway configuration
├── nixpacks.toml       # Nixpacks build configuration
└── Procfile            # Process definition
```

## ⚙️ Configuration Files

### **railway.json**
```json
{
  "$schema": "https://railway.app/railway.schema.json",
  "build": {
    "builder": "NIXPACKS"
  },
  "deploy": {
    "startCommand": "uvicorn backend.main:app --host 0.0.0.0 --port $PORT",
    "healthcheckPath": "/health",
    "healthcheckTimeout": 100,
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 10
  }
}
```

### **nixpacks.toml**
```toml
python = "3.9"

[build]
cmds = ["pip install -r requirements.txt"]

[start]
cmd = "uvicorn backend.main:app --host 0.0.0.0 --port $PORT"

[deploy]
healthcheckPath = "/health"
```

## 🌐 Routes & Endpoints

### **Frontend**
- Main App: `https://your-app.up.railway.app/app`
- Static Files: `https://your-app.up.railway.app/static/`

### **API Endpoints**
- Health Check: `https://your-app.up.railway.app/health`
- Audio Analysis: `https://your-app.up.railway.app/analyze`
- API Root: `https://your-app.up.railway.app/`

## 🔍 Testing Deployment

### **Health Check**
```bash
curl https://your-app.up.railway.app/health
```

Expected response:
```json
{
  "status": "ok",
  "model_loaded": false,
  "service": "SleepGuard API",
  "version": "1.0.0"
}
```

### **Frontend Access**
Visit `https://your-app.up.railway.app/app` and test:
- ✅ Sleep Space photo upload
- ✅ Auto Record with MP3 conversion
- ✅ Audio file upload and analysis
- ✅ Spectrogram generation

## 🔧 Environment Variables

Set in Railway Dashboard → Variables:
```
PORT=8000                    # Auto-set by Railway
PYTHONPATH=./backend         # Python module path
```

## 🐛 Troubleshooting

### **Common Issues**

#### **Build Fails**
```
Error: Command "pip install -r requirements.txt" failed
```
**Solution**: 
- Check requirements.txt exists in root
- Verify Python dependencies are compatible
- Check build logs in Railway dashboard

#### **App Crashes on Start**
```
Error: cannot bind to 0.0.0.0:$PORT
```
**Solution**:
- Ensure start command uses `$PORT` environment variable
- Check main.py uses `os.environ.get("PORT", 8000)`

#### **Static Files Not Found**
```
404: File not found
```
**Solution**:
- Verify index.html is in root directory
- Check static file mounting in main.py
- Ensure relative paths are correct

### **Performance**
- **Cold Start**: ~15-30 seconds for first request
- **Memory**: 512MB (default, can be increased)
- **Storage**: Ephemeral (files deleted on restart)

## 📊 Monitoring

### **Railway Dashboard**
- Real-time logs and metrics
- CPU/Memory usage monitoring
- Build and deployment history
- Environment variable management

### **Health Monitoring**
- Automatic health checks on `/health`
- Restart on failure (configured)
- Uptime monitoring available

## 🔐 Security

### **CORS Configuration**
```python
origins = [
    "https://*.railway.app",
    "https://*.up.railway.app",
    # Add your custom domain here
]
```

### **File Security**
- 50MB upload limit
- Audio format validation
- Temporary file cleanup
- No persistent storage

## 💰 Pricing

### **Railway Pricing**
- **Hobby Plan**: $5/month + usage
- **Pro Plan**: $20/month + usage
- **Resource-based billing**: CPU, Memory, Network

### **Estimated Costs**
- **Light Usage**: ~$5-10/month
- **Medium Usage**: ~$15-25/month
- **Heavy Usage**: ~$30-50/month

## 🚀 Production Checklist

- [ ] Deploy successfully to Railway
- [ ] Health check endpoint responds
- [ ] Frontend accessible at `/app`
- [ ] Audio analysis works end-to-end
- [ ] MP3 conversion functions properly
- [ ] Spectrogram generation working
- [ ] Custom domain configured (optional)
- [ ] Monitoring enabled
- [ ] Environment variables set
- [ ] Performance tested

## 🔄 Continuous Deployment

### **Automatic Deployments**
- **Main Branch**: Auto-deploy on push
- **Pull Requests**: Preview deployments available
- **Rollback**: Easy rollback to previous versions

### **GitHub Integration**
- Connected to repository
- Webhook-based deployments
- Build status notifications

## 🌐 Custom Domain

1. **Add Domain in Railway**
   - Dashboard → Project → Settings → Domains
   - Add your custom domain

2. **Configure DNS**
   - Add CNAME record pointing to Railway
   - Wait for DNS propagation (~24 hours)

3. **SSL Certificate**
   - Automatically provisioned by Railway
   - Let's Encrypt integration

## 📞 Support Resources

- [Railway Documentation](https://docs.railway.app/)
- [Python Deployment Guide](https://docs.railway.app/deploy/deployments)
- [FastAPI on Railway](https://railway.app/template/fastapi)

---

**Your SleepDiagnosis app is now ready for Railway deployment! 🚂**

🌐 **Live Demo**: https://sleepdiagnosis.up.railway.app/app  
📚 **Repository**: https://github.com/akarsh-2005/sleepdiagnosis  
🚂 **Deploy**: [![Deploy on Railway](https://railway.app/button.svg)](https://railway.app/new/template/sleepdiagnosis)