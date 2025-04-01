import axios from "axios";
import WebSocket from "ws";

const BASE_URL = "https://passiogo.com";

/// Helper Functions ///

function toIntInclNone(toInt: any): number | null {
  if (toInt === null || toInt === undefined || toInt === "") {
    return null;
  }
  return parseInt(toInt);
}

async function sendApiRequest(url: string, body: any): Promise<any> {
  try {
    const response = await axios.post(url, body);

    const data = response.data;

    if ("error" in data && data["error"] !== "") {
      throw new Error(
        `Error in Response! Here is the received response: ${JSON.stringify(
          data
        )}`
      );
    }

    return data;
  } catch (e: any) {
    throw new Error(`Error with API request: ${e.message}`);
  }
}

/// Transportation Systems ///

export class TransportationSystem {
  id: number;
  name: string | null;
  username: string | null;
  goAgencyName: string | null;
  email: string | null;
  goTestMode: boolean | null;
  name2: boolean | null;
  homepage: string | null;
  logo: boolean | null;
  goRoutePlannerEnabled: boolean | null;
  goColor: string | null;
  goSupportEmail: string | null;
  goSharedCode: number | null;
  goAuthenticationType: boolean | null;

  constructor(
    id: number,
    name: string | null = null,
    username: string | null = null,
    goAgencyName: string | null = null,
    email: string | null = null,
    goTestMode: boolean | null = null,
    name2: boolean | null = null,
    homepage: string | null = null,
    logo: boolean | null = null,
    goRoutePlannerEnabled: boolean | null = null,
    goColor: string | null = null,
    goSupportEmail: string | null = null,
    goSharedCode: number | null = null,
    goAuthenticationType: boolean | null = null
  ) {
    this.id = id;
    this.name = name;
    this.username = username;
    this.goAgencyName = goAgencyName;
    this.email = email;
    this.goTestMode = goTestMode;
    this.name2 = name2;
    this.homepage = homepage;
    this.logo = logo;
    this.goRoutePlannerEnabled = goRoutePlannerEnabled;
    this.goColor = goColor;
    this.goSupportEmail = goSupportEmail;
    this.goSharedCode = goSharedCode;
    this.goAuthenticationType = goAuthenticationType;

    this.checkTypes();
  }

  checkTypes(): void {
    // id : number
    if (typeof this.id !== "number") {
      throw new Error(`'id' parameter must be a number not ${typeof this.id}`);
    }

    // name : string or null
    if (this.name !== null && typeof this.name !== "string") {
      throw new Error(
        `'name' parameter must be a string not ${typeof this.name}`
      );
    }

    // username : string or null
    if (this.username !== null && typeof this.username !== "string") {
      throw new Error(
        `'username' parameter must be a string not ${typeof this.username}`
      );
    }

    // goAgencyName : string or null
    if (this.goAgencyName !== null && typeof this.goAgencyName !== "string") {
      throw new Error(
        `'goAgencyName' parameter must be a string not ${typeof this
          .goAgencyName}`
      );
    }

    // email : string or null
    if (this.email !== null && typeof this.email !== "string") {
      throw new Error(
        `'email' parameter must be a string not ${typeof this.email}`
      );
    }

    // goTestMode : boolean or null
    if (this.goTestMode !== null && typeof this.goTestMode !== "boolean") {
      throw new Error(
        `'goTestMode' parameter must be a boolean not ${typeof this.goTestMode}`
      );
    }

    // name2 : boolean or null
    if (this.name2 !== null && typeof this.name2 !== "boolean") {
      throw new Error(
        `'name2' parameter must be a boolean not ${typeof this.name2}`
      );
    }

    // homepage : string or null
    if (this.homepage !== null && typeof this.homepage !== "string") {
      throw new Error(
        `'homepage' parameter must be a string not ${typeof this.homepage}`
      );
    }

    // logo : boolean or null
    if (this.logo !== null && typeof this.logo !== "boolean") {
      throw new Error(
        `'logo' parameter must be a boolean not ${typeof this.logo}`
      );
    }

    // goRoutePlannerEnabled : boolean or null
    if (
      this.goRoutePlannerEnabled !== null &&
      typeof this.goRoutePlannerEnabled !== "boolean"
    ) {
      throw new Error(
        `'goRoutePlannerEnabled' parameter must be a boolean not ${typeof this
          .goRoutePlannerEnabled}`
      );
    }

    // goColor : string or null
    if (this.goColor !== null && typeof this.goColor !== "string") {
      throw new Error(
        `'goColor' parameter must be a string not ${typeof this.goColor}`
      );
    }

    // goSupportEmail : string or null
    if (
      this.goSupportEmail !== null &&
      typeof this.goSupportEmail !== "string"
    ) {
      throw new Error(
        `'goSupportEmail' parameter must be a string not ${typeof this
          .goSupportEmail}`
      );
    }

    // goSharedCode : number or null
    if (this.goSharedCode !== null && typeof this.goSharedCode !== "number") {
      throw new Error(
        `'goSharedCode' parameter must be a number not ${typeof this
          .goSharedCode}`
      );
    }

    // goAuthenticationType : boolean or null
    if (
      this.goAuthenticationType !== null &&
      typeof this.goAuthenticationType !== "boolean"
    ) {
      throw new Error(
        `'goAuthenticationType' parameter must be a boolean not ${typeof this
          .goAuthenticationType}`
      );
    }
  }

  async getRoutes(
    appVersion: number = 1,
    amount: number = 1
  ): Promise<Route[]> {
    /*
    Obtains every route for the selected system.
    =========
    systemSelected: system from which to get content
    paramDigit: does not affect content of response, only formatting
    amount:
      1: Returns all routes for given system
      0: Not Valid, Gives Error
      >=2: Returns all routes for given system in addition to unrelated routes. Exact methodology unsure.
    */

    // Initialize & Send Request
    const url = `${BASE_URL}/mapGetData.php?getRoutes=${appVersion}`;
    const body = {
      systemSelected0: this.id.toString(),
      amount: amount,
    };
    let routes = await sendApiRequest(url, body);

    if (routes === null) {
      return [];
    }

    // Handle Differing Response Format
    if ("all" in routes) {
      routes = routes["all"];
    }

    const allRoutes: Route[] = [];
    for (const route of routes) {
      const possibleKeys = [
        "id",
        "groupId",
        "groupColor",
        "name",
        "shortName",
        "nameOrig",
        "fullname",
        "myid",
        "mapApp",
        "archive",
        "goPrefixRouteName",
        "goShowSchedule",
        "outdated",
        "distance",
        "latitude",
        "longitude",
        "timezone",
        "serviceTime",
        "serviceTimeShort",
      ];

      for (const possibleKey of possibleKeys) {
        if (!(possibleKey in route)) {
          route[possibleKey] = null;
        }
      }

      allRoutes.push(
        new Route(
          route["id"],
          route["groupId"],
          route["groupColor"],
          route["name"],
          route["shortName"],
          route["nameOrig"],
          route["fullname"],
          route["myid"],
          route["mapApp"],
          route["archive"],
          route["goPrefixRouteName"],
          route["goShowSchedule"],
          route["outdated"],
          route["distance"],
          route["latitude"],
          route["longitude"],
          route["timezone"],
          route["serviceTime"],
          route["serviceTimeShort"],
          parseInt(route["userId"]),
          this
        )
      );
    }

    return allRoutes;
  }

  async getStops(
    appVersion: number = 2,
    sA: number = 1,
    raw: boolean = false
  ): Promise<Stop[]> {
    /*
    Obtains all stop for the given system.
    =========
    appVersion: No discernible change
    sA:
      0: error
      1: Returns all stops for the given system
      >=2: Returns unrelated stops as well
    */

    // Initialize & Send Request
    const url = `${BASE_URL}/mapGetData.php?getStops=${appVersion}`;
    const body = {
      s0: this.id.toString(),
      sA: sA,
    };
    const stops = await sendApiRequest(url, body);

    if (raw) {
      return stops;
    }

    if (stops === null) {
      return [];
    }

    if (stops["routes"].length === 0) {
      stops["routes"] = {};
    }

    if (stops["stops"].length === 0) {
      stops["stops"] = {};
    }

    // Create Route & Stops Dictionary
    // {routeid -> [stopid, stopid]}
    const routesAndStops: Record<string, any[]> = {};
    for (const [routeId, route] of Object.entries(stops["routes"])) {
      routesAndStops[routeId] = [];
      for (const stop of (route as any[]).slice(2)) {
        if (stop === 0) {
          continue;
        }
        routesAndStops[routeId].push(stop[1]);
      }
    }

    // Create Each Stop Object
    const allStops: Stop[] = [];
    for (const [id, stop] of Object.entries<any>(stops["stops"])) {
      // Create Route & Positions Dictionary
      // {routeid -> [position]}
      const routesAndPositions: Record<string, number[]> = {};
      for (const routeId of Object.keys(routesAndStops)) {
        if (!routesAndStops[routeId].includes(stop["id"])) {
          continue;
        }
        routesAndPositions[routeId] = routesAndStops[routeId]
          .map((x, i) => (x === stop["id"] ? i : -1))
          .filter((i) => i !== -1);
      }

      const keys = ["userId", "radius"];
      for (const key of keys) {
        if (!(key in stop)) {
          stop[key] = null;
        }
      }

      allStops.push(
        new Stop(
          stop["id"],
          routesAndPositions,
          stop["userId"] === null ? null : parseInt(stop["userId"]),
          stop["name"],
          stop["latitude"],
          stop["longitude"],
          stop["radius"],
          this
        )
      );
    }

    return allStops;
  }

  async getSystemAlerts(
    appVersion: number = 1,
    amount: number = 1,
    routesAmount: number = 0
  ): Promise<SystemAlert[]> {
    /*
    Gets all system alerts for the selected system.
    =========
    systemSelected: system from which to get content
    appVersion:
      0: Error
      >=1: Valid
    */

    // Initialize & Send Request
    const url = `${BASE_URL}/goServices.php?getAlertMessages=${appVersion}`;
    const body = {
      systemSelected0: this.id.toString(),
      amount: amount,
      routesAmount: routesAmount,
    };
    const errorMsgs = await sendApiRequest(url, body);

    if (errorMsgs === null) {
      return [];
    }

    // Create SystemAlert Objects
    const allAlerts: SystemAlert[] = [];
    for (const errorMsg of errorMsgs["msgs"]) {
      allAlerts.push(
        new SystemAlert(
          errorMsg["id"],
          errorMsg["userId"],
          this,
          errorMsg["routeId"],
          errorMsg["name"],
          errorMsg["html"],
          errorMsg["archive"],
          errorMsg["important"],
          errorMsg["created"],
          errorMsg["from"],
          errorMsg["to"],
          errorMsg["asPush"],
          errorMsg["gtfs"],
          errorMsg["gtfsAlertCauseId"],
          errorMsg["gtfsAlertEffectId"],
          errorMsg["gtfsAlertUrl"],
          errorMsg["gtfsAlertHeaderText"],
          errorMsg["gtfsAlertDescriptionText"],
          errorMsg["routeGroupId"],
          errorMsg["createdUtc"],
          errorMsg["authorId"],
          errorMsg["author"],
          errorMsg["updated"],
          errorMsg["updateAuthorId"],
          errorMsg["updateAuthor"],
          errorMsg["createdF"],
          errorMsg["fromF"],
          errorMsg["fromOk"],
          errorMsg["toOk"]
        )
      );
    }

    return allAlerts;
  }

  async getVehicles(appVersion: number = 2): Promise<Vehicle[]> {
    /*
    Gets all currently running buses.
    =========
    s0: system from which to get content
    paramDigit:
      0: Error
      >=1: Valid
    */

    // Initialize & Send Request
    const url = `${BASE_URL}/mapGetData.php?getBuses=${appVersion}`;
    const body = {
      s0: this.id.toString(),
      sA: 1,
    };
    const vehicles = await sendApiRequest(url, body);

    if (vehicles === null) {
      return [];
    }

    const allVehicles: Vehicle[] = [];
    for (const [vehicleId, vehicle] of Object.entries<any>(vehicles["buses"])) {
      if (vehicleId === "-1") {
        continue;
      }

      const vehicleData = vehicle[0];

      for (const key of [
        "busId",
        "busName",
        "busType",
        "calculatedCourse",
        "routeId",
        "route",
        "color",
        "created",
        "latitude",
        "longitude",
        "speed",
        "paxLoad100",
        "outOfService",
        "more",
        "tripId",
      ]) {
        if (!(key in vehicleData)) {
          vehicleData[key] = null;
        }
      }

      allVehicles.push(
        new Vehicle(
          vehicleData["busId"],
          vehicleData["busName"],
          vehicleData["busType"],
          this,
          vehicleData["calculatedCourse"],
          vehicleData["routeId"],
          vehicleData["route"],
          vehicleData["color"],
          vehicleData["created"],
          vehicleData["latitude"],
          vehicleData["longitude"],
          vehicleData["speed"],
          vehicleData["paxLoad100"],
          vehicleData["outOfService"],
          vehicleData["more"],
          vehicleData["tripId"]
        )
      );
    }

    return allVehicles;
  }
}

export async function getSystems(
  appVersion: number = 2,
  sortMode: number = 1
): Promise<TransportationSystem[]> {
  /*
  Gets all systems. Returns a list of TransportationSystem.
  
  sortMode: Unknown
  appVersion:
    <2: Error
    2: Valid
  */

  // Initialize & Send Request
  const url = `${BASE_URL}/mapGetData.php?getSystems=${appVersion}&sortMode=${sortMode}&credentials=1`;
  const systems = await sendApiRequest(url, null);

  if (systems === null) {
    return [];
  }

  const allSystems: TransportationSystem[] = [];
  for (const system of systems["all"]) {
    // Convert Empty Strings To None Objects
    for (const parameter in system) {
      if (system[parameter] === "") {
        system[parameter] = null;
      }
    }

    // Check all keys exist
    for (const key of [
      "goAgencyName",
      "email",
      "goTestMode",
      "name2",
      "homepage",
      "logo",
      "goRoutePlannerEnabled",
      "goColor",
      "goSupportEmail",
      "goSharedCode",
      "goAuthenticationType",
    ]) {
      if (!(key in system)) {
        system[key] = null;
      }
    }

    allSystems.push(
      new TransportationSystem(
        parseInt(system["id"]),
        system["fullname"],
        system["username"],
        system["goAgencyName"],
        system["email"],
        system["goTestMode"] ? Boolean(parseInt(system["goTestMode"])) : null,
        system["name2"] ? Boolean(parseInt(system["name2"])) : null,
        system["homepage"],
        system["logo"] ? Boolean(parseInt(system["logo"])) : null,
        system["goRoutePlannerEnabled"]
          ? Boolean(parseInt(system["goRoutePlannerEnabled"]))
          : null,
        system["goColor"],
        system["goSupportEmail"],
        toIntInclNone(system["goSharedCode"]),
        system["goAuthenticationType"]
          ? Boolean(parseInt(system["goAuthenticationType"]))
          : null
      )
    );
  }

  return allSystems;
}

export async function getSystemFromID(
  id: number,
  appVersion: number = 2,
  sortMode: number = 1
): Promise<TransportationSystem | null> {
  // Check Input Type
  if (typeof id !== "number") {
    throw new Error("`id` must be of type number");
  }

  if (typeof appVersion !== "number") {
    throw new Error("`appVersion` must be of type number");
  }

  // Check sort Mode Type
  if (typeof sortMode !== "number") {
    throw new Error("`sortMode` must be of type number");
  }

  const systems = await getSystems(appVersion, sortMode);

  for (const system of systems) {
    if (system.id === id) {
      return system;
    }
  }
  return null;
}

export function printAllSystemsMd(includeHtmlBreaks: boolean = true): void {
  getSystems().then((systems) => {
    for (const system of systems) {
      console.log(
        `- ${system.name} (#${system.id})${includeHtmlBreaks ? "<br/>" : ""}`
      );
    }
  });
}

/// Routes ///

export class Route {
  id: number;
  groupId: number | null;
  groupColor: string | null;
  name: string | null;
  shortName: string | null;
  nameOrig: string | null;
  fullname: string | null;
  myid: number | null;
  mapApp: boolean | null;
  archive: boolean | null;
  goPrefixRouteName: boolean | null;
  goShowSchedule: boolean | null;
  outdated: boolean | null;
  distance: number | null;
  latitude: number | null;
  longitude: number | null;
  timezone: string | null;
  serviceTime: string | null;
  serviceTimeShort: string | null;
  systemId: number | null;
  system: TransportationSystem | null;

  constructor(
    id: number,
    groupId: number | null = null,
    groupColor: string | null = null,
    name: string | null = null,
    shortName: string | null = null,
    nameOrig: string | null = null,
    fullname: string | null = null,
    myid: number | null = null,
    mapApp: boolean | null = null,
    archive: boolean | null = null,
    goPrefixRouteName: boolean | null = null,
    goShowSchedule: boolean | null = null,
    outdated: boolean | null = null,
    distance: number | null = null,
    latitude: number | null = null,
    longitude: number | null = null,
    timezone: string | null = null,
    serviceTime: string | null = null,
    serviceTimeShort: string | null = null,
    systemId: number | null = null,
    system: TransportationSystem | null = null
  ) {
    this.id = id;
    this.groupId = groupId;
    this.groupColor = groupColor;
    this.name = name;
    this.shortName = shortName;
    this.nameOrig = nameOrig;
    this.fullname = fullname;
    this.myid = myid;
    this.mapApp = mapApp;
    this.archive = archive;
    this.goPrefixRouteName = goPrefixRouteName;
    this.goShowSchedule = goShowSchedule;
    this.outdated = outdated;
    this.distance = distance;
    this.latitude = latitude;
    this.longitude = longitude;
    this.timezone = timezone;
    this.serviceTime = serviceTime;
    this.serviceTimeShort = serviceTimeShort;
    this.systemId = systemId;
    this.system = system;
  }

  async getStops(): Promise<Stop[]> {
    /*
    Gets the list of stops for this route and stores it as an argument
    */
    if (!this.system) {
      return [];
    }

    const stopsForRoute: Stop[] = [];
    const allStops = await this.system.getStops();

    for (const stop of allStops) {
      if (
        (this.myid &&
          Object.keys(stop.routesAndPositions).includes(
            this.myid.toString()
          )) ||
        Object.keys(stop.routesAndPositions).includes(this.id.toString()) ||
        (this.groupId &&
          Object.keys(stop.routesAndPositions).includes(
            this.groupId.toString()
          ))
      ) {
        stopsForRoute.push(stop);
      }
    }

    return stopsForRoute;
  }
}

/// Stops ///

export class Stop {
  id: string;
  routesAndPositions: Record<string, number[]>;
  systemId: number | null;
  name: string | null;
  latitude: number | null;
  longitude: number | null;
  radius: number | null;
  system: TransportationSystem | null;

  constructor(
    id: string,
    routesAndPositions: Record<string, number[]> = {},
    systemId: number | null = null,
    name: string | null = null,
    latitude: number | null = null,
    longitude: number | null = null,
    radius: number | null = null,
    system: TransportationSystem | null = null
  ) {
    this.id = id;
    this.routesAndPositions = routesAndPositions;
    this.systemId = systemId;
    this.name = name;
    this.latitude = latitude;
    this.longitude = longitude;
    this.radius = radius;
    this.system = system;
  }
}

/// System Alerts ///

export class SystemAlert {
  id: number;
  systemId: number | null;
  system: TransportationSystem | null;
  routeId: number | null;
  name: string | null;
  html: string | null;
  archive: boolean | null;
  important: boolean | null;
  dateTimeCreated: string | null;
  dateTimeFrom: string | null;
  dateTimeTo: string | null;
  asPush: boolean | null;
  gtfs: boolean | null;
  gtfsAlertCauseId: number | null;
  gtfsAlertEffectId: number | null;
  gtfsAlertUrl: string | null;
  gtfsAlertHeaderText: string | null;
  gtfsAlertDescriptionText: string | null;
  routeGroupId: number | null;
  createdUtc: string | null;
  authorId: number | null;
  author: string | null;
  updated: string | null;
  updateAuthorId: number | null;
  updateAuthor: string | null;
  createdF: string | null;
  fromF: string | null;
  fromOk: boolean | null;
  toOk: boolean | null;

  constructor(
    id: number,
    systemId: number | null = null,
    system: TransportationSystem | null = null,
    routeId: number | null = null,
    name: string | null = null,
    html: string | null = null,
    archive: boolean | null = null,
    important: boolean | null = null,
    dateTimeCreated: string | null = null,
    dateTimeFrom: string | null = null,
    dateTimeTo: string | null = null,
    asPush: boolean | null = null,
    gtfs: boolean | null = null,
    gtfsAlertCauseId: number | null = null,
    gtfsAlertEffectId: number | null = null,
    gtfsAlertUrl: string | null = null,
    gtfsAlertHeaderText: string | null = null,
    gtfsAlertDescriptionText: string | null = null,
    routeGroupId: number | null = null,
    createdUtc: string | null = null,
    authorId: number | null = null,
    author: string | null = null,
    updated: string | null = null,
    updateAuthorId: number | null = null,
    updateAuthor: string | null = null,
    createdF: string | null = null,
    fromF: string | null = null,
    fromOk: boolean | null = null,
    toOk: boolean | null = null
  ) {
    this.id = id;
    this.systemId = systemId;
    this.system = system;
    this.routeId = routeId;
    this.name = name;
    this.html = html;
    this.archive = archive;
    this.important = important;
    this.dateTimeCreated = dateTimeCreated;
    this.dateTimeFrom = dateTimeFrom;
    this.dateTimeTo = dateTimeTo;
    this.asPush = asPush;
    this.gtfs = gtfs;
    this.gtfsAlertCauseId = gtfsAlertCauseId;
    this.gtfsAlertEffectId = gtfsAlertEffectId;
    this.gtfsAlertUrl = gtfsAlertUrl;
    this.gtfsAlertHeaderText = gtfsAlertHeaderText;
    this.gtfsAlertDescriptionText = gtfsAlertDescriptionText;
    this.routeGroupId = routeGroupId;
    this.createdUtc = createdUtc;
    this.authorId = authorId;
    this.author = author;
    this.updated = updated;
    this.updateAuthorId = updateAuthorId;
    this.updateAuthor = updateAuthor;
    this.createdF = createdF;
    this.fromF = fromF;
    this.fromOk = fromOk;
    this.toOk = toOk;
  }
}

/// Vehicles ///

export class Vehicle {
  id: string | null;
  name: string | null;
  type: string | null;
  system: TransportationSystem | null;
  calculatedCourse: number | null;
  routeId: string | null;
  routeName: string | null;
  color: string | null;
  created: string | null;
  latitude: number | null;
  longitude: number | null;
  speed: number | null;
  paxLoad: number | null;
  outOfService: boolean | null;
  more: string | null;
  tripId: string | null;

  constructor(
    id: string | null = null,
    name: string | null = null,
    type: string | null = null,
    system: TransportationSystem | null = null,
    calculatedCourse: number | null = null,
    routeId: string | null = null,
    routeName: string | null = null,
    color: string | null = null,
    created: string | null = null,
    latitude: number | null = null,
    longitude: number | null = null,
    speed: number | null = null,
    paxLoad: number | null = null,
    outOfService: boolean | null = null,
    more: string | null = null,
    tripId: string | null = null
  ) {
    this.id = id;
    this.name = name;
    this.type = type;
    this.system = system;
    this.calculatedCourse = calculatedCourse;
    this.routeId = routeId;
    this.routeName = routeName;
    this.color = color;
    this.created = created;
    this.latitude = latitude;
    this.longitude = longitude;
    this.speed = speed;
    this.paxLoad = paxLoad;
    this.outOfService = outOfService;
    this.more = more;
    this.tripId = tripId;
  }
}

/// Live Timings ///
/// Not Yet Supported! ///

// Launch WebSocket
export function launchWS(userId: number): WebSocket {
  const uri = "wss://passio3.com/";

  const ws = new WebSocket(uri);

  ws.on("open", () => {
    subscribeWS(ws, userId);
  });

  ws.on("error", (error) => {
    handleWsError(ws, error);
  });

  ws.on("close", (code, reason) => {
    handleWsClose(ws, code, reason);
  });

  return ws;
}

function handleWsError(ws: WebSocket, error: Error): void {
  console.error("WebSocket error:", error);
}

function handleWsClose(ws: WebSocket, code: number, reason: Buffer): void {
  ws.close();
}

function subscribeWS(ws: WebSocket, userId: number): void {
  const subscriptionMsg = {
    subscribe: "location",
    userId: [userId],
    field: ["busId", "latitude", "longitude", "course", "paxLoad", "more"],
  };
  ws.send(JSON.stringify(subscriptionMsg));
}
