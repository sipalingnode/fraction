import axios from "axios";
import chalk from "chalk";
import figlet from "figlet";
import Web3 from "web3";
import fs from "fs/promises";
import JoinSpace from "./space.js";
import getSessions from "./session.js";

const displayBanner = () => {
console.log(chalk.cyan.bold(`   █████████   █████ ███████████   ██████████   ███████████      ███████    ███████████       █████████    █████████    █████████`));
console.log(chalk.cyan.bold(`  ███░░░░░███ ░░███ ░░███░░░░░███ ░░███░░░░███ ░░███░░░░░███   ███░░░░░███ ░░███░░░░░███     ███░░░░░███  ███░░░░░███  ███░░░░░███`));
console.log(chalk.cyan.bold(` ░███    ░███  ░███  ░███    ░███  ░███   ░░███ ░███    ░███  ███     ░░███ ░███    ░███    ░███    ░███ ░███    ░░░  ███     ░░░`));
console.log(chalk.cyan.bold(` ░███████████  ░███  ░██████████   ░███    ░███ ░██████████  ░███      ░███ ░██████████     ░███████████ ░░█████████ ░███         `));
console.log(chalk.cyan.bold(` ░███░░░░░███  ░███  ░███░░░░░███  ░███    ░███ ░███░░░░░███ ░███      ░███ ░███░░░░░░      ░███░░░░░███  ░░░░░░░░███░███         `));
console.log(chalk.cyan.bold(` ░███    ░███  ░███  ░███    ░███  ░███    ███  ░███    ░███ ░░███     ███  ░███            ░███    ░███  ███    ░███░░███     ███`));
console.log(chalk.cyan.bold(` █████   █████ █████ █████   █████ ██████████   █████   █████ ░░░███████░   █████           █████   █████░░█████████  ░░█████████`));
console.log(chalk.cyan.bold(` ░░░░░   ░░░░░ ░░░░░ ░░░░░   ░░░░░ ░░░░░░░░░░   ░░░░░   ░░░░░    ░░░░░░░    ░░░░░           ░░░░░   ░░░░░  ░░░░░░░░░    ░░░░░░░░░  `));
console.log(chalk.cyan.bold(`==============================================`));
console.log(chalk.cyan.bold(`    Telegram Channel : @airdropasc              `)); 
console.log(chalk.cyan.bold(`    Telegram Group   : @autosultan_group        `)); 
console.log(chalk.cyan.bold(`==============================================`));
}
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const login = async (privateKey) => {
    const web3 = new Web3(new Web3.providers.HttpProvider("https://sepolia.infura.io"));
    const account = web3.eth.accounts.privateKeyToAccount(privateKey);
    web3.eth.accounts.wallet.add(account);

    const getNonce = await axios.get('https://dapp-backend-large.fractionai.xyz/api3/auth/nonce');
    const nonce = getNonce.data.nonce;
    console.log(chalk.green(`Nonce: ${nonce}`));

    const issuedAt = new Date().toISOString();
    const message = `dapp.fractionai.xyz wants you to sign in with your Ethereum account:
${account.address}

Sign in with your wallet to Fraction AI.

URI: https://dapp.fractionai.xyz
Version: 1
Chain ID: 11155111
Nonce: ${nonce}
Issued At: ${issuedAt}`;

    const signature = web3.eth.accounts.sign(message, privateKey);
    const payload = {
        message,
        signature: signature.signature,
        referralCode: "F65B3BBD"
    };

    const loginData = await axios.post('https://dapp-backend-large.fractionai.xyz/api3/auth/verify', payload, {
        headers: {
            'Content-Type': 'application/json',
        }
    });
    
    return loginData.data;
};

const main = async () => {
    displayBanner();
    console.log(chalk.blue(''));
    const wallet = (await fs.readFile('wallet.txt', 'utf-8'))
        .replace(/\r/g, "")
        .split('\n')
        .filter(Boolean);

    while (true) {
        for (let i = 0; i < wallet.length; i++) {
            try {
                const privateKey = wallet[i];
                const formattedPrivateKey = privateKey.startsWith('0x') ? privateKey : '0x' + privateKey;
                const getlogin = await login(formattedPrivateKey);
                const getAiagent = await JoinSpace(getlogin.accessToken, getlogin.user.id);
                console.log(chalk.green(`Login Sukses: ${getlogin.user.walletAddress} \nJumlah Fractal : ${getlogin.user.fractal}`));
                console.log(chalk.green(`Total agent: ${getAiagent.aiagentId.length}`));
                for (let j = 0; j < getAiagent.aiagentId.length; j++) {
                    const aiagentId = getAiagent.aiagentId[j];
                    const agentName = getAiagent.nameAgent[j];
                    const session = await getSessions(getlogin);
                    if (session.length < 6) {
                        try {
                            const joinSpace = await axios.post(
                                `https://dapp-backend-large.fractionai.xyz/api3/matchmaking/initiate`,
                                { userId: getlogin.user.id, agentId: aiagentId, entryFees: 0.001, sessionTypeId: 1 },
                                {
                                    headers: {
                                        Authorization: `Bearer ${getlogin.accessToken}`,
                                        'Content-Type': 'application/json'
                                    }
                                }
                            );
                        
                            if (joinSpace.status === 200) {
                                console.log(chalk.green(`Success join space with ${agentName} : agentId: ${aiagentId} `));
                            }
                        } catch (error) {
                            if (error.response.data.error.includes('6 for the hour')) {
                                console.log(chalk.yellow(`Session penuh `));
                                console.log(chalk.yellow('Wait 1 jam untuk Join Space'));
                                await delay(3600000);
                            } else if (error.response) {
                                console.log(chalk.yellow(`Failed join space with ${agentName} agent: ${aiagentId}, Status: ${error.response.status}, Reason: ${error.response.data.error || "Unknown"}`));
                            } else {
                                console.log(chalk.red(`Error occurred: ${error.message}`));
                            }
                        }
                    } else if ( session.length >= 6 ) { 
                        console.log(chalk.yellow(`Session penuh `));
                        console.log(chalk.yellow('Wait 1 jam untuk Join Space'));
                        await delay(180000);
                    } else {
                        console.log(chalk.yellow(` Error Session tidak ditemukan `));
                    }
                    
                }
            } catch (error) {
                console.error(error);
            }
        }
        console.log(chalk.blue('Wait 10 menit'));
        await delay(180000);
    }
};

main();
