from app import create_app
import os
import sys

def main():
    """Main function to start the Academic Explanation Platform backend"""
    
    try:
        # Create the Flask application
        app = create_app()
        
        # Get configuration from environment variables
        debug_mode = os.environ.get('FLASK_ENV') == 'development'
        port = int(os.environ.get('FLASK_RUN_PORT', 5000))
        host = os.environ.get('FLASK_RUN_HOST', '0.0.0.0')
        
        # Display startup information
        print("=" * 60)
        print("🎓 ACADEMIC EXPLANATION PLATFORM BACKEND")
        print("=" * 60)
        print(f"Environment: {'Development' if debug_mode else 'Production'}")
        print(f"Server URL: http://{host}:{port}")
        print(f"API Base URL: http://{host}:{port}/api/")
        print("\n📡 Available Endpoints:")
        print("  GET  /api/health                 - Health check")
        print("  POST /api/explain                - Generate explanations")
        print("  GET  /api/topics/search          - Search topics")
        print("  GET  /api/image-sources/status   - Image sources status")
        print("  GET  /api/model/info             - AI model information")
        print("\n🔑 Required Environment Variables:")
        print(f"  GEMINI_API_KEY: {'✅ Set' if os.environ.get('GEMINI_API_KEY') else '❌ Missing'}")
        print(f"  DATABASE_URL: {'✅ Set' if os.environ.get('DATABASE_URL') else '⚠️  Using default'}")
        print("=" * 60)
        print("🚀 Starting server...")
        
        # Run the Flask application
        app.run(
            debug=debug_mode,
            host=host,
            port=port,
            threaded=True,
            use_reloader=debug_mode  # Auto-reload in development
        )
        
    except KeyboardInterrupt:
        print("\n\n👋 Shutting down Academic Explanation Platform Backend...")
        sys.exit(0)
        
    except Exception as e:
        print(f"\n❌ Error starting application: {str(e)}")
        print("Please check your configuration and try again.")
        sys.exit(1)

if __name__ == '__main__':
    main()
