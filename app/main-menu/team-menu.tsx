import { DeletePlayerTeam, GetPlayerTeamList, PutActivePlayerTeam } from "@/src/api/team/service";
import { PlayerTeam } from "@/src/api/team/type";
import CardComponent from "@/src/components/general/CardComponent";
import ConfirmationModalComponent from "@/src/components/general/ConfirmationModalComponent";
import FooterListViewComponent from "@/src/components/general/FooterListViewComponent";
import LoadingModalComponent from "@/src/components/general/LoadingModalComponent";
import { getUnitCardImagePath } from "@/src/services/generalService";
import { gs } from "@/src/styles/globalStyles";
import { ConfirmationModalData } from "@/src/types/general/confirmationType";
import { useFocusEffect, useRouter } from "expo-router";
import { CheckSquare2Icon, PlusSquareIcon, Trash2Icon, UsersRoundIcon } from "lucide-react-native";
import { memo, useCallback, useRef, useState } from "react";
import { FlatList, ListRenderItem, Pressable, Text, View } from "react-native";

const TeamComponent = memo(({
    h, teamID, name, level, imgURL1, level1, imgURL2, level2, imgURL3, level3, isActive,
    element1_1, element1_2, element2_1, element2_2, element3_1, element3_2,
    onSetActivePress, onDeletePress }: {
        h: number;
        teamID: string;
        name: string;
        level: number;
        imgURL1: string;
        level1: number;
        imgURL2: string;
        level2: number;
        imgURL3: string;
        level3: number;
        element1_1: number;
        element1_2: number;
        element2_1: number;
        element2_2: number;
        element3_1: number;
        element3_2: number;
        isActive: boolean;
        onSetActivePress: (teamID: string) => void;
        onDeletePress: (teamID: string) => void;
    }) => {
    const handleSetActivePress = () => {
        if (isActive) return;
        onSetActivePress(teamID);
    }

    const handleDeletePress = () => {
        if (isActive) return;
        onDeletePress(teamID);
    }

    return (
        <View style={[{ width: '100%', height: h }, gs.p5, gs.border_top]}>
            <View style={[gs.full_size, gs.f1, gs.column]}>
                <View style={[gs.full_size, gs.f1, gs.all_center]}>
                    <Text>
                        lvl. {level}
                    </Text>
                </View>
                <View style={[gs.full_size, gs.f4, gs.all_center]}>
                    <Text style={gs.border_bottom}>
                        {name}
                    </Text>
                </View>
                <Pressable style={[gs.full_size, gs.f1, gs.all_center]}
                    onPress={handleSetActivePress}
                    accessibilityLabel="button">
                    <CheckSquare2Icon color={isActive ? 'rgb(77, 244, 99)' : 'grey'} />
                </Pressable>
                <Pressable style={[gs.full_size, gs.f1, gs.all_center]}
                    onPress={handleDeletePress}
                    accessibilityLabel="button">
                    <Trash2Icon color={'red'} />
                </Pressable>
            </View>
            <View style={[gs.full_size, gs.f4, gs.column]}>
                <View style={[gs.f1, gs.full_size, gs.p5]}>
                    <CardComponent
                        imgURL={imgURL1}
                        footerText={`lvl. ${level1}`}
                        elements={[element1_1, element1_2]}
                    />
                </View>
                <View style={[gs.f1, gs.full_size, gs.p5]}>
                    <CardComponent
                        imgURL={imgURL2}
                        footerText={`lvl. ${level2}`}
                        elements={[element2_1, element2_2]}
                    />
                </View>
                <View style={[gs.f1, gs.full_size, gs.p5]}>
                    <CardComponent
                        imgURL={imgURL3}
                        footerText={`lvl. ${level3}`}
                        elements={[element3_1, element3_2]}
                    />
                </View>
            </View>
        </View>
    );
});

const TeamMenu = memo(() => {
    const [isLoading, setIsLoading] = useState(true);
    const [refreshKey, setRefreshKey] = useState(0);
    const [currPage, setCurrPage] = useState(1);
    const [totalPage, setTotalPage] = useState(1);
    const [listHeight, setListHeight] = useState(0);
    const [playerTeams, setPlayerTeams] = useState<PlayerTeam[]>([]);
    const [selectedTeamID, setSelectedTeamID] = useState('');
    const confirmationData = useRef<ConfirmationModalData>({
        message: 'Are you sure want to delete ?',
        noText: 'NO',
        yesText: 'YES'
    });
    const router = useRouter();

    const fetch = useCallback(async (page: number) => {
        try {
            const res = await GetPlayerTeamList(5, page);
            if (!res.success) return;

            const updatedList = await Promise.all(res.data.playerTeams.map(async (teams): Promise<PlayerTeam> => {
                return {
                    ...teams,
                    playerUnit1: { ...teams.playerUnit1, imgURL: await getUnitCardImagePath(teams.playerUnit1.origin, teams.playerUnit1.unitCode, teams.playerUnit1.imageTypeNumber) },
                    playerUnit2: { ...teams.playerUnit2, imgURL: await getUnitCardImagePath(teams.playerUnit2.origin, teams.playerUnit2.unitCode, teams.playerUnit2.imageTypeNumber) },
                    playerUnit3: { ...teams.playerUnit3, imgURL: await getUnitCardImagePath(teams.playerUnit3.origin, teams.playerUnit3.unitCode, teams.playerUnit3.imageTypeNumber) }
                }
            }));

            setPlayerTeams(updatedList);
            setTotalPage(Math.max(res.data.totalPage, 1));
        }
        finally {
            setIsLoading(false);
        }
    }, []);

    useFocusEffect(
        useCallback(() => {
            setIsLoading(true);
            setPlayerTeams([]);
            fetch(Math.max(currPage, 1));
        }, [currPage, refreshKey, fetch])
    );

    const handleTeamPress = useCallback(() => {
        router.push('/team-menu-screen');
    }, [router]);

    const onDeletePress = useCallback((teamID: string) => {
        setSelectedTeamID(teamID);
    }, []);

    const onNoDeletePress = useCallback(() => {
        setSelectedTeamID('');
    }, []);

    const onYesDeletePress = useCallback(async () => {
        setIsLoading(true);

        try {
            const res = await DeletePlayerTeam(selectedTeamID);
            if (!res.success) return;

            await setRefreshKey(prev => prev + 1);
        }
        finally {
            setSelectedTeamID('');
        }
    }, [selectedTeamID]);

    const onSetActivePress = useCallback(async (teamID: string) => {
        setIsLoading(true);

        try {
            const res = await PutActivePlayerTeam({ teamID: teamID });
            if (!res.success) return;

            await setRefreshKey(prev => prev + 1);
        }
        finally {
            setIsLoading(false);
        }
    }, [selectedTeamID]);

    const ITEM_HEIGHT = listHeight / 2.7;
    const renderItem: ListRenderItem<PlayerTeam> = useCallback(({ item }) => {
        return (
            <TeamComponent
                h={ITEM_HEIGHT}
                teamID={item.teamID}
                name={item.teamName}
                level={item.teamLevel}
                imgURL1={item.playerUnit1.imgURL}
                level1={item.playerUnit1.level}
                imgURL2={item.playerUnit2.imgURL}
                level2={item.playerUnit2.level}
                imgURL3={item.playerUnit3.imgURL}
                level3={item.playerUnit3.level}
                element1_1={item.playerUnit1.elementID1}
                element1_2={item.playerUnit1.elementID2}
                element2_1={item.playerUnit2.elementID1}
                element2_2={item.playerUnit2.elementID2}
                element3_1={item.playerUnit3.elementID1}
                element3_2={item.playerUnit3.elementID2}
                isActive={item.isActive}
                onSetActivePress={onSetActivePress}
                onDeletePress={onDeletePress}
            />
        )
    }, [ITEM_HEIGHT, onDeletePress, onSetActivePress]);



    const onNextPress = () => {
        if (isLoading) return;

        setCurrPage((prev) => Math.min(prev + 1, totalPage));
    };

    const onPrevPress = () => {
        if (isLoading) return;

        setCurrPage((prev) => Math.max(prev - 1, 1));
    };

    return (
        <View style={[gs.full_size, gs.all_center, gs.row]}>
            <View style={[gs.f1, gs.column, gs.header]}>
                <Pressable style={[gs.f1, gs.all_center, gs.column, gs.full_size]}
                    onPress={handleTeamPress}>
                    <PlusSquareIcon />
                </Pressable>
                <View style={[gs.f2, gs.all_center, gs.column, gs.full_size]} >
                    <UsersRoundIcon />
                    <Text>TEAMS</Text>
                </View>
                <View style={[gs.f1]}></View>
            </View>
            <View style={[gs.f8, gs.full_size]}>
                <View style={[gs.full_size]}
                    onLayout={(e) => setListHeight(e.nativeEvent.layout.height)}>
                    {listHeight > 0 &&
                        <FlatList
                            renderItem={renderItem}
                            data={playerTeams}
                            keyExtractor={(team) => team.teamID}
                        />
                    }
                </View>
            </View>
            <View style={[gs.f1, gs.all_center]}>
                <FooterListViewComponent
                    currPage={currPage}
                    totalPage={totalPage}
                    onNextPress={onNextPress}
                    onPrevPress={onPrevPress} />
            </View>
            <LoadingModalComponent visible={isLoading} />
            <ConfirmationModalComponent
                visible={selectedTeamID !== ''}
                data={confirmationData.current}
                onClose={onNoDeletePress}
                onConfirm={onYesDeletePress}>
            </ConfirmationModalComponent>
        </View>
    );
});

export default TeamMenu;