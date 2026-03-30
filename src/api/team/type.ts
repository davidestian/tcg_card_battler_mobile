import { PlayerUnit } from "../inventory/type";

export interface GetPlayerTeamRS {
    playerTeams: PlayerTeam[];
    totalPage: number;
}

export interface PlayerTeam {
    teamID: string;
    teamName: string;
    isActive: boolean;
    teamLevel: number;
    playerUnit1: PlayerUnit;
    playerUnit2: PlayerUnit;
    playerUnit3: PlayerUnit;
}

export interface PostPlayerTeamRQ {
    teamName: string;
    playerUnitID1: string;
    playerUnitID2: string;
    playerUnitID3: string;
}

export interface PutActivePlayerTeamRQ {
    teamID: string;
}