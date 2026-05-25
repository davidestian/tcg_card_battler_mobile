import { GetActivePlayerTeamID, GetPlayerTeamByTeamID } from "@/src/api/team/service";
import { PlayerTeam } from "@/src/api/team/type";
import LoadingModalComponent from "@/src/components/general/LoadingModalComponent";
import MessageModalComponent from "@/src/components/general/MessageModalComponent";
import { TeamSummaryComponent } from "@/src/components/general/TeamSummaryComponent";
import { getUnitCardImagePath } from "@/src/services/generalService";
import { scaleMin } from "@/src/services/scalingSizeService";
import { gs } from "@/src/styles/globalStyles";
import { useFocusEffect, useRouter } from "expo-router";
import { LucideIcon, SignalHighIcon, SignalIcon, SignalLowIcon, SignalMediumIcon, SwordsIcon } from "lucide-react-native";
import { memo, useCallback, useState } from "react";
import { FlatList, ListRenderItem, Pressable, Text, View } from "react-native";

interface menus {
    title: string;
    goToURL: () => void;
    icon: LucideIcon;
    color: string;
    description: string;
}

const BattleMenu = memo(() => {
    const [isReady, setIsReady] = useState(false);
    const [listHeight, setListHeight] = useState(0);
    const router = useRouter();
    const [message, setMessage] = useState('');

    const [team, setTeam] = useState<PlayerTeam | undefined>();

    const init = useCallback(async () => {
        const res = await GetActivePlayerTeamID();
        if (!res.success || res.data === '') {
            setMessage('No active team found.\nPlease set active team in team menu');
            return;
        }

        const resTeam = await GetPlayerTeamByTeamID(res.data);
        if (!resTeam.success) {
            setMessage('Active team not valid.\nnPlease set active team in team menu');
            return;
        }

        const [img1, img2, img3] = await Promise.all([
            getUnitCardImagePath(resTeam.data.playerUnit1.origin, resTeam.data.playerUnit1.unitCode, resTeam.data.playerUnit1.imageTypeNumber),
            getUnitCardImagePath(resTeam.data.playerUnit2.origin, resTeam.data.playerUnit2.unitCode, resTeam.data.playerUnit2.imageTypeNumber),
            getUnitCardImagePath(resTeam.data.playerUnit3.origin, resTeam.data.playerUnit3.unitCode, resTeam.data.playerUnit3.imageTypeNumber)
        ]);
        resTeam.data.playerUnit1.imgURL = img1;
        resTeam.data.playerUnit2.imgURL = img2;
        resTeam.data.playerUnit3.imgURL = img3;

        setMessage('');
        setTeam(resTeam.data);
        setIsReady(true);
    }, []);

    useFocusEffect(
        useCallback(() => {
            setIsReady(false);
            init();
        }, [init])
    );

    const onCloseMessage = useCallback(() => {
        router.replace({
            pathname: '/main-menu/team-menu'
        });
    }, [])

    const menus: menus[] = [
        {
            title: 'EASY BATTLE',
            description: 'GOLD x 1\nEnemy will randomly flip card',
            goToURL: () => {
                router.replace({
                    pathname: '/battle',
                    params: {
                        teamID: team?.teamID,
                        dificulty: "easy"
                    }
                });
            },
            icon: SignalLowIcon,
            color: 'rgb(0, 228, 23)'
        },
        {
            title: 'MEDIUM BATTLE',
            description: 'GOLD x 10\nEnemy have 25% chance to flip showed cards',
            goToURL: () => {
                router.replace({
                    pathname: '/battle',
                    params: {
                        teamID: team?.teamID,
                        dificulty: "medium"
                    }
                });
            },
            icon: SignalMediumIcon,
            color: 'rgb(201, 228, 0)'
        },
        {
            title: 'HARD BATTLE',
            description: 'GOLD x 25\nEnemy have 50% chance to flip showed cards',
            goToURL: () => {
                router.replace({
                    pathname: '/battle',
                    params: {
                        teamID: team?.teamID,
                        dificulty: "hard"
                    }
                });
            },
            icon: SignalHighIcon,
            color: 'rgb(228, 141, 0)'
        },
        {
            title: 'VERY HARD BATTLE',
            description: 'GOLD x 50\nEnemy have 75% chance to flip showed cards',
            goToURL: () => {
                router.replace({
                    pathname: '/battle',
                    params: {
                        teamID: team?.teamID,
                        dificulty: "very hard"
                    }
                });
            },
            icon: SignalIcon,
            color: 'rgb(228, 27, 0)'
        },
        {
            title: 'INSANE BATTLE',
            description: 'GOLD x 100\nEnemy have 100% chance to flip showed cards',
            goToURL: () => {
                router.replace({
                    pathname: '/battle',
                    params: {
                        teamID: team?.teamID,
                        dificulty: "insane"
                    }
                });
            },
            icon: SignalIcon,
            color: 'rgb(137, 137, 137)'
        }
    ];

    const ITEM_HEIGHT = listHeight / 3;
    const renderItem: ListRenderItem<menus> = useCallback(({ item }) => {
        return (
            <View
                style={[{ height: ITEM_HEIGHT, width: '100%' }, gs.p5]}>
                <Pressable
                    style={[gs.full_size, gs.border_card, gs.all_center, { backgroundColor: item.color }]}
                    onPress={item.goToURL}>
                    <item.icon />
                    <Text>
                        {item.title}{'\n'}
                    </Text>
                    <Text style={gs.text_center}>
                        {item.description}
                    </Text>
                </Pressable>
            </View>
        )
    }, [ITEM_HEIGHT]);

    const onTeamPress = useCallback(() => {
        router.replace({
            pathname: '/main-menu/team-menu',
            params: {
                teamID: team?.teamID
            }
        });
    }, []);

    return (
        <View style={gs.full_size}>
            <View style={[gs.f1, gs.full_size, gs.header, gs.all_center, gs.column]}>
                <SwordsIcon size={scaleMin(18)} /><Text> BATTLE </Text><SwordsIcon size={scaleMin(18)} />
            </View>
            <View style={[gs.f3, gs.full_size, gs.p10]}>
                {team !== undefined &&
                    <TeamSummaryComponent
                        name={team.teamName}
                        level={team.teamLevel}
                        imgURL1={team.playerUnit1.imgURL}
                        imgURL2={team.playerUnit2.imgURL}
                        imgURL3={team.playerUnit3.imgURL}
                        level1={team.playerUnit1.level}
                        level2={team.playerUnit2.level}
                        level3={team.playerUnit3.level}
                        element1_1={team.playerUnit1.elementID1}
                        element1_2={team.playerUnit1.elementID2}
                        element2_1={team.playerUnit2.elementID1}
                        element2_2={team.playerUnit2.elementID2}
                        element3_1={team.playerUnit3.elementID1}
                        element3_2={team.playerUnit3.elementID2}
                        onPress={onTeamPress}
                    ></TeamSummaryComponent>
                }
            </View>
            <View style={[gs.f6, gs.full_size, gs.p10, gs.border_top]}
                onLayout={(e) => setListHeight(e.nativeEvent.layout.height)}>
                {isReady && listHeight > 0 &&
                    <FlatList
                        data={menus}
                        keyExtractor={(item) => item.title}
                        renderItem={renderItem} />
                }
            </View>
            <MessageModalComponent message={message} onClose={onCloseMessage}></MessageModalComponent>
            <LoadingModalComponent visible={!isReady}></LoadingModalComponent>
        </View>
    );
});

export default BattleMenu;