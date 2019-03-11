export type StatusInfo =
	| {
			kind: "ServedStarted";
			port: number;
	  }
	| {
			kind: "ClientConnected";
	  };
