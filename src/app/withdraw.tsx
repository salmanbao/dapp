import { useEffect, useState } from "react";
import styles from "./topup.module.css"; // Assuming you're using CSS modules
import {
  ContractFunctionExecutionError,
  Hash,
  IntegerOutOfRangeError,
  TransactionReceipt,
  WalletClient,
  createWalletClient,
  custom,
  formatEther,
  parseEther,
} from "viem";
import { goerli } from "viem/chains";
import { Dapp } from "@/abi";
import { client } from "@/config";
import { useAccount } from "wagmi";
import { ToastContainer, toast } from "react-toastify";

function Withdraw() {
  // amount to withdraw
  const [amount, setAmount] = useState("");

  // user topup token balance deposited in Dapp
  const [balance, setBalance] = useState("0");

  // just to keep track of loading state
  const [isPending, setPending] = useState(true);

  // hash of the transaction
  const [hash, setHash] = useState<Hash>("0x");

  // transaction receipt of the transaction
  const [receipt, setReceipt] = useState<TransactionReceipt>();

  const [walletClient, setwalletClient] = useState<WalletClient>();

  // current connect wallet
  const account = useAccount();

  // let walletClient: WalletClient;

  // used to do prefectching of user deposited topup tokens
  const prefetch = async () => {
    const [balanceCall] = await Promise.all([
      client.readContract({
        abi: Dapp.abi,
        address: `0x${Dapp.address}`,
        functionName: "balances",
        args: [account.address],
      }),
    ]);
    setBalance(formatEther(balanceCall as bigint));
    setPending(false);
  };

  useEffect(() => {
    const fetchData = async () => {
      await prefetch();
    };
    fetchData();

    //
    (async () => {
      // intializing our wallet client so we can call smart contract functions
      setwalletClient(
        createWalletClient({
          chain: goerli,
          transport: custom(window.ethereum!),
        })
      );
    })();
  }, []);

  // Call Dapp smart contract withdraw function
  const withdraw = async (e: any) => {
    e.preventDefault();
    try {
      setPending(true);

      const { request } = await client.simulateContract({
        abi: Dapp.abi,
        address: `0x${Dapp.address}`,
        functionName: "withdraw",
        args: [parseEther(amount)],
        account: account.address,
      });

      const hash = await walletClient?.writeContract(request);
      const transaction = await client.waitForTransactionReceipt({
        hash: hash!,
      });
      toast.info(`tx:${transaction.transactionHash}`);
      setReceipt(receipt);
      setHash(hash!);
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

  if (walletClient == null) {
    return <p>Loading...</p>;
  }

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

        {!isPending && (
          <button className={styles.btn} onClick={withdraw}>
            Withdraw
          </button>
        )}
      </div>
      <ToastContainer />
    </div>
  );
}

export default Withdraw;
