 # Blockchain Certificates NFT Project
## Setup & Development Workflow

### Getting Started
1. **Clone the Repository**
   ```
   git clone https://github.com/RXROW/blockchain-certificates-nft
   cd blockchain-certificates-nft
   ```

2. **Pull Latest Changes from `main`**
   ```
   git pull origin main
   ```

3. **Create a Feature Branch to Start Coding**
   ```
   git checkout -b EA-feature
   ```

### Running the Application

#### Step 1: Install Dependencies
**Root Folder:**
```
npm install
npm install --save-dev hardhat
npx hardhat --version  # Verify Hardhat installed
```

**Client Folder:**
```
cd client
npm install
```

#### Step 2: Start the Local Blockchain Node
```
cd ..
npx hardhat node
```

#### Step 3: Deploy Smart Contracts to Local Network
```
npx hardhat run scripts/deploy.js --network localhost
```

#### Step 4: Run the Frontend
```
cd client
npm run dev
```

### Submitting Your Work

#### Final Step: Push Your Changes & Create a PR
**Commit & Push Your Code**
```
git add .
git commit -m "Your commit message here"
git push origin EA-feature
```

**Create Pull Request**
* Go to GitHub
* Create a Pull Request from your branch
* Assign **me** as a reviewer 👀

> **⚠️ Note:** Never commit directly to the **`main`** branch. Always create a new feature branch for your changes.
