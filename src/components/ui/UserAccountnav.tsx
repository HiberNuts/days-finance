"use client";
import { signOut } from "next-auth/react";
import { Button } from "./button";

const UserAccountnav = () => {
  return (
    <Button
      onClick={() =>
        signOut({
          redirect: true,
          callbackUrl: `${window.location.origin}/login`,
        })
      }
    >
      Sign Out
    </Button>
  );
};

export default UserAccountnav;
