import { useEffect, useState } from "react";
import styles from "./topup.module.css"; // Assuming you're using CSS modules
import { Dapp, Erc20 } from "@/abi";
import { useAccount } from "wagmi";
import {
  ContractFunctionExecutionError,
  createWalletClient,
  custom,
  formatEther,
  Hash,
  IntegerOutOfRangeError,
  parseEther,
  parseUnits,
  TransactionReceipt,
  WalletClient,
} from "viem";
import { client, config } from "@/config";
import { writeContract } from "@wagmi/core";
import { goerli } from "viem/chains";
import { ToastContainer, toast } from "react-toastify";

function toBigInt(n: string) {
  return n as unknown as bigint;
}

function Topup() {

   // amount to deposit
   const [amount, setAmount] = useState("");

  // user topup token balance deposited in user wallet
  const [balance, setBalance] = useState("0");

  // topup token allowance to Dapp contract
  const [allowance, setAllowance] = useState(parseEther("0"));

  // just to keep track of loading state
  const [isPending, setPending] = useState(true);

  // hash of the transaction
  const [hash, setHash] = useState<Hash>("0x");

  // transaction receipt of the transaction
  const [receipt, setReceipt] = useState<TransactionReceipt>();

  let walletClient: WalletClient;

  const ZERO = parseUnits("0", 18);
  const MAX = toBigInt(
    "115792089237316195423570985008687907853269984665640564039457584007913129639935"
  );
    
  // Get current connected account
  const account = useAccount();

  // used to do prefectching of user balances
  const prefetch = async () => {
    const [balanceCall, allowanceCall] = await Promise.all([
      client.readContract({
        abi: Erc20.abi,
        address: `0x${Erc20.address}`,
        functionName: "balanceOf",
        args: [account.address],
      }),
      client.readContract({
        abi: Erc20.abi,
        address: `0x${Erc20.address}`,
        functionName: "allowance",
        args: [account.address, `0x${Dapp.address}`],
      }),
    ]);
    setBalance(formatEther(balanceCall as bigint));
    setAllowance(allowanceCall as bigint);
    setPending(false);
  };

  // Call the topup token smart contract to approve tokens
  const approve = async (e: any) => {
    e.preventDefault();
    try {
      const result = await writeContract(config, {
        abi: Erc20.abi,
        address: `0x${Erc20.address}`,
        functionName: "approve",
        args: [`0x${Dapp.address}`, MAX as unknown as bigint],
      });
      console.log(`tx hash: ${result}`);
    } catch (error) {
      console.log("tx cancelled");
    }
  };

  // Call Dapp smart contract deposit function
  const deposit = async (e: any) => {
    e.preventDefault();
    try {
      setPending(true);
      console.log("submitting tx", parseEther(amount.toString()));
      const { request } = await client.simulateContract({
        abi: Dapp.abi,
        address: `0x${Dapp.address}`,
        functionName: "topup",
        args: [parseEther(amount)],
        account: account.address,
      });

      const hash = await walletClient.writeContract(request);
      setHash(hash);
    } catch (error) {
      if (error instanceof IntegerOutOfRangeError) {
        toast.error("Amount should be positive number");
      }
      if (error instanceof ContractFunctionExecutionError) {
        let err = error as unknown as ContractFunctionExecutionError;
        if (err.message.includes("ZeroAmount()")) {
          toast.error("Amount should be greater than zero");
        } else if (err.message.includes("TransferFaild()")) {
          toast.error("Transfer Failed");
        } else if (err.message.includes("IsufficientBalance()")) {
          toast.error("You don't have sufficient balance");
        } else {
          toast.error("You don't have sufficient balance");
        }
      }
    }
    setPending(false);
  };

  useEffect(() => {
    const fetchData = async () => {
      await prefetch();
    };
    fetchData();

    (async () => {
      // watching the hash for new transactions
      if (hash.length > 2) {
        const receipt = await client.waitForTransactionReceipt({ hash });
        toast.done(`tx:${receipt.transactionHash}`);
        setReceipt(receipt);
      }

      // intializing our wallet client so we can call smart contract functions
      if (window.ethereum != undefined) {
        walletClient = createWalletClient({
          chain: goerli,
          transport: custom(window.ethereum!),
        });
      }
    })();
  }, [hash]);

  return (
    <div>
      <div className={styles.form}>
        <label id="amountLabel">Amount</label>
        <div className="form-group">
          <input
            className={styles.formControl}
            type="number"
            name="amount"
            value={amount}
            onChange={(e) => {
              setAmount(e.target.value);
            }}
            required
          />
          <div className={styles.balance}>Balance: {balance.toString()}</div>
        </div>

        {isPending && <button className={styles.btn}>Loading</button>}

        {!isPending && allowance > ZERO && (
          <button className={styles.btn} onClick={deposit}>
            Deposit
          </button>
        )}

        {!isPending && allowance == ZERO && (
          <button className={styles.btn} onClick={approve}>
            Approve
          </button>
        )}
      </div>
      <ToastContainer />
    </div>
  );
}

export default Topup;
