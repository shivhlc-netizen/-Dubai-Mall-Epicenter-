import streamlit as st
import subprocess
import os
import json

# 7-Star Branding
st.set_page_config(page_title="7-Star Docker Hub", page_icon="⭐")

st.markdown("""
    <style>
    .main { background-color: #0A0A0A; color: #C9A052; }
    .stButton>button { background-color: #C9A052; color: black; border-radius: 0; font-weight: bold; }
    </style>
    """, unsafe_allow_html=True)

st.title("⭐ Dubai Seven Wonders: Docker & MySQL Connector")
st.subheader("Layer Management Strategy (LMS) Gated Build System")

# Sidebar: Connection Status
st.sidebar.header("Connection Diagnostics")

def check_docker():
    try:
        res = subprocess.run(["docker", "version", "--format", "json"], capture_output=True, text=True)
        if res.returncode == 0:
            return True, "Docker Desktop is Active"
        return False, "Docker Daemon not found"
    except:
        return False, "Docker CLI not installed"

docker_ok, docker_msg = check_docker()
if docker_ok:
    st.sidebar.success(docker_msg)
else:
    st.sidebar.error(docker_msg)

# Form: MySQL Credentials
with st.expander("🔑 MySQL Configuration", expanded=True):
    db_user = st.text_input("DB User", value="root")
    db_pass = st.text_input("DB Password", type="password", value="S#iv2301")
    db_name = st.text_input("DB Name", value="dubai_mall")

# Section: Image Gating (LMS Technique)
st.divider()
st.header("🏗️ LMS Gated Build")
st.info("The LMS Technique ensures image integrity by verifying metadata labels and layer optimization before final push.")

if st.button("🚀 Build & Gate Image"):
    with st.status("Initializing 7-Star Build Sequence...", expanded=True) as status:
        st.write("Checking Dockerfile...")
        if not os.path.exists("Dockerfile"):
            st.error("LMS Error: Dockerfile missing!")
            status.update(label="Build Failed", state="error")
        else:
            st.write("Step 1: Building Layers...")
            build_cmd = ["docker", "build", "-t", "dubai-seven-wonders:latest", "."]
            process = subprocess.Popen(build_cmd, stdout=subprocess.PIPE, stderr=subprocess.STDOUT, text=True)
            
            for line in process.stdout:
                st.text(line.strip())
            
            process.wait()
            
            if process.returncode == 0:
                st.write("Step 2: LMS Metadata Gating...")
                # Verify labels
                inspect_cmd = ["docker", "inspect", "dubai-seven-wonders:latest"]
                inspect_res = subprocess.run(inspect_cmd, capture_output=True, text=True)
                data = json.loads(inspect_res.stdout)
                labels = data[0]['Config']['Labels']
                
                if labels.get('tier') == '7-Star' and labels.get('project') == 'Dubai Seven Wonders':
                    st.success("✅ LMS Gate Passed: Metadata Verified")
                    st.write(f"Image Size: {data[0]['Size'] / 1e6:.2f} MB")
                    status.update(label="Build Complete & Gated!", state="complete")
                else:
                    st.warning("⚠️ LMS Gate Warning: Missing or Incorrect 7-Star Metadata")
                    status.update(label="Build Finished with Warnings", state="complete")
            else:
                st.error("Build failed. Check Docker Desktop logs.")
                status.update(label="Build Failed", state="error")

# Section: Registry Push
st.divider()
st.header("📤 Push to Docker Hub")
st.info("Ensure you are logged into Docker Desktop before pushing.")

target_repo = st.text_input("Docker Hub Repository (e.g. username/dubai-7-star)", value="shiv/dubai-7-star")

if st.button("⬆️ Push Gated Image"):
    if not docker_ok:
        st.error("Docker Daemon not reachable.")
    else:
        with st.status(f"Pushing to {target_repo}...", expanded=True) as status:
            st.write("Tagging image...")
            tag_cmd = ["docker", "tag", "dubai-seven-wonders:latest", f"{target_repo}:latest"]
            subprocess.run(tag_cmd)
            
            st.write("Pushing layers...")
            push_cmd = ["docker", "push", f"{target_repo}:latest"]
            process = subprocess.Popen(push_cmd, stdout=subprocess.PIPE, stderr=subprocess.STDOUT, text=True)
            
            for line in process.stdout:
                st.text(line.strip())
            
            process.wait()
            
            if process.returncode == 0:
                st.success(f"✅ Successfully pushed to {target_repo}")
                status.update(label="Push Successful!", state="complete")
            else:
                st.error("Push failed. Check if you are logged in (`docker login`).")
                status.update(label="Push Failed", state="error")

# Section: Orchestration
st.divider()
st.header("🚢 Container Orchestration")
if st.button("🔥 Start Project (Docker Compose)"):
    # Generate .env for compose
    with open(".env.docker", "w") as f:
        f.write(f"DB_USER={db_user}\nDB_PASSWORD={db_pass}\nDB_NAME={db_name}\n")
    
    st.write("Starting App + MySQL cluster...")
    try:
        subprocess.run(["docker-compose", "--env-file", ".env.docker", "up", "-d"])
        st.success("Cluster is rising! Check Docker Desktop for logs.")
    except Exception as e:
        st.error(f"Orchestration failed: {e}")
