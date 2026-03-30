import { getUserDetail } from "@/src/api/account/service";
import { GetAccountDetailResponse } from "@/src/api/account/type";
import { GetActivePlayerTeamID, GetPlayerTeamByTeamID } from "@/src/api/team/service";
import { PlayerTeam } from "@/src/api/team/type";
import { MyText } from "@/src/components/general/MyText";
import SettingModalComponent from "@/src/components/general/SettingModalComponent";
import { TeamSummaryComponent } from "@/src/components/general/TeamSummaryComponent";
import { getUnitCardImagePath } from "@/src/services/generalService";
import { gs } from "@/src/styles/globalStyles";
import { router, useFocusEffect } from "expo-router";
import { SettingsIcon } from "lucide-react-native";
import { memo, useCallback, useState } from "react";
import { Pressable, View } from "react-native";

const Index = memo(() => {
    const [account, setAccount] = useState<GetAccountDetailResponse>({
        accountID: '',
        accountEXP: 0n,
        accountLevel: 0, accountName: '',
        email: '',
        gold: 0n
    });

    const [showSettins, setShowSettings] = useState(false);
    const [team, setTeam] = useState<PlayerTeam>();

    useFocusEffect(useCallback(() => {
        setShowSettings(false);
        setTeam(undefined);
        init();
    }, []));

    const getAccountDetail = useCallback(async () => {
        const res = await getUserDetail();
        if (!res.success) return;

        setAccount(res.data);
    }, []);

    const getActivePlayerTeam = useCallback(async () => {
        const res = await GetActivePlayerTeamID();
        if (!res.success || res.data === '') return;

        const resTeam = await GetPlayerTeamByTeamID(res.data);
        if (!resTeam.success) return;

        const [img1, img2, img3] = await Promise.all([
            getUnitCardImagePath(resTeam.data.playerUnit1.origin, resTeam.data.playerUnit1.unitCode, resTeam.data.playerUnit1.imageTypeNumber),
            getUnitCardImagePath(resTeam.data.playerUnit2.origin, resTeam.data.playerUnit2.unitCode, resTeam.data.playerUnit2.imageTypeNumber),
            getUnitCardImagePath(resTeam.data.playerUnit3.origin, resTeam.data.playerUnit3.unitCode, resTeam.data.playerUnit3.imageTypeNumber)
        ]);

        resTeam.data.playerUnit1.imgURL = img1;
        resTeam.data.playerUnit2.imgURL = img2;
        resTeam.data.playerUnit3.imgURL = img3;

        setTeam(resTeam.data);
    }, []);

    const init = useCallback(async () => {
        await Promise.all([
            getAccountDetail(),
            getActivePlayerTeam()

        ]);
    }, [getAccountDetail, getActivePlayerTeam]);

    const onShowSettingModal = async () => {
        setShowSettings(true);
    }

    const onCloseSettingModal = async () => {
        setShowSettings(false);
    }

    const onTeamPress = useCallback(() => {
        router.replace({
            pathname: '/main-menu/team-menu',
            params: {
                teamID: team?.teamID
            }
        });
    }, []);

    return (
        <View style={[gs.full_size]}>
            <View style={[gs.f1, gs.full_size, gs.column, gs.header]}>
                <View style={[gs.f2, gs.all_center]}>
                    <MyText>
                        {account.accountName}
                    </MyText>
                </View>
                <View style={[gs.f1, gs.all_center]}>
                    <MyText>
                        G : {account.gold}
                    </MyText>
                </View>
                <View style={[gs.f1, gs.all_center]}>
                    <Pressable onPress={onShowSettingModal}><SettingsIcon /></Pressable>
                </View>
            </View>
            <View style={[gs.f3, gs.p5]}>
                <View style={[gs.full_size, gs.all_center, gs.border_card]}>
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
                        />
                    }
                    {
                        team === undefined &&
                        <MyText>NO ACTIVE TEAM</MyText>
                    }
                </View>
            </View>
            <View style={[gs.full_size, gs.f6, gs.all_center]}>
                <MyText>NO EVENT YET</MyText>
            </View>
            {showSettins &&
                <SettingModalComponent onClose={onCloseSettingModal} />
            }
        </View>
    );
});

export default Index;