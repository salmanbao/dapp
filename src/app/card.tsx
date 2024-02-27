import React from "react";
import styles from "./card.module.css";
import Topup from "./topup";
import Withdraw from "./withdraw";

function Tab(props: any) {
  return (
    <div className={styles.tabs__content}>
      <h3>{props.tab.title}</h3>
      <div>{props.tab.children}</div>
    </div>
  );
}

function Navigation(props: any) {
  return (
    <ul className={styles.tabs__nav}>
      {props.tabs.map((item: any) => (
        <li key={item.id} className={styles.tabs__item}>
          <button
            className={`${styles.tabs__button} ${
              props.activeTabId === item.id ? "active" : ""
            }`}
            onClick={() => props.onNavClick(item.id)}
          >
            {item.name}
          </button>
        </li>
      ))}
    </ul>
  );
}

function Tabs(props: any) {
  const [activeTabId, setActiveTab] = React.useState(props.tabs[0].id);

  const activeTab = React.useMemo(
    () => props.tabs.find((tab: any) => tab.id === activeTabId),
    [activeTabId, props.tabs]
  );

  return (
    <div className={styles.tabs}>
      <Navigation
        tabs={props.tabs}
        onNavClick={setActiveTab}
        activeTabId={activeTabId}
      />
      <Tab tab={activeTab} />
    </div>
  );
}

const Menu = () => {
  const tabs = [
    {
      id: 1,
      name: "Topup",
      title: "Deposit Topup Tokens",
      children: <Topup />,
    },
    {
      id: 2,
      name: "Withdraw",
      title: "Withdraw Topup Tokens",
      children: <Withdraw />,
    },
  ];

  return (
    <div className={styles.container}>
      <Tabs tabs={tabs} />
    </div>
  );
};

export default Menu;
