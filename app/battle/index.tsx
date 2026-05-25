import { battleGetPlayerTeamUnits, battleGetRandomEnemyBattleUnits } from "@/src/api/battle/service";
import { BattleUnit } from "@/src/api/battle/type";
import BattleEvolveModalComponent from "@/src/components/battle/BattleEvolveModalComponent";
import BattleResultModalComponent from "@/src/components/battle/BattleResultModalComponent";
import ChangeTurnModalComponent from "@/src/components/battle/ChangeTurnModalComponent";
import BattleCardSlotComponent from "@/src/components/general/BattleCardSlotComponent";
import CardComponent from "@/src/components/general/CardComponent";
import ConfirmationModalComponent from "@/src/components/general/ConfirmationModalComponent";
import LoadingModalComponent from "@/src/components/general/LoadingModalComponent";
import { PlayerColor, StatColor } from "@/src/enums/colorEnum";
import { getRandomInt, getUnitCardImagePath } from "@/src/services/generalService";
import { scaleMin } from "@/src/services/scalingSizeService";
import { gs } from "@/src/styles/globalStyles";
import { BattleCardSlotType } from "@/src/types/battleTypes";
import { router, useFocusEffect, useLocalSearchParams } from "expo-router";
import { CircleQuestionMarkIcon, Columns2Icon, Columns3Icon, CpuIcon, Dice6Icon, DicesIcon, FlameIcon, GaugeIcon, HandFistIcon, LogOutIcon, LucideIcon, PowerIcon, RectangleVerticalIcon, ShieldIcon } from "lucide-react-native";
import { memo, useCallback, useEffect, useRef, useState } from "react";
import { FlatList, ListRenderItem, Pressable, StyleSheet, Text, View } from "react-native";
import AnimatedNumbers from 'react-native-animated-numbers';
import Animated, { BounceOut, FadeIn, FadeOut, FlipInEasyX, FlipOutEasyX, SlideInDown, SlideInUp, SlideOutDown, SlideOutUp } from "react-native-reanimated";

interface ShowedCardType {
    key: string;
    val1: number;
    val2: number;
}

interface SummaryTeamUnitType {
    imgURI: string;
    level: number;
    element1: number;
    element2: number;
}

interface SummaryTeamType {
    stats: number[];
    units: SummaryTeamUnitType[]
}

const CardSlotComponent = memo(({ h, idx, isShow, cardID, onPress }: {
    h: number;
    idx: number;
    isShow: boolean;
    cardID: string;
    onPress: (index: number) => void;
}) => {
    const handlePress = () => {
        onPress(idx);
    };
    let iconName: LucideIcon;
    let color = 'white';
    switch (cardID) {
        case 'UT1':
            iconName = RectangleVerticalIcon;
            break;
        case 'UT2':
            iconName = Columns2Icon;
            break;
        case 'UT3':
            iconName = Columns3Icon;
            break;
        case 'RND1':
            iconName = Dice6Icon;
            break;
        case 'RND2':
            iconName = DicesIcon;
            break;
        case 'OFF':
            iconName = HandFistIcon;
            color = StatColor.offense;
            break;
        case 'DEF':
            iconName = ShieldIcon;
            color = StatColor.defense;
            break;
        case 'TEC':
            iconName = CpuIcon;
            color = StatColor.technique;
            break;
        case 'SPD':
            iconName = GaugeIcon;
            color = StatColor.speed;
            break;
        case 'SPT':
            iconName = FlameIcon;
            color = StatColor.spirit;
            break;
        default:
            iconName = CircleQuestionMarkIcon;
    };

    return (
        <View style={[{ width: '20%', height: h }, gs.p5]}>
            {cardID !== '' &&
                <Animated.View
                    entering={FadeIn}
                    exiting={BounceOut}
                    style={[gs.full_size]}>
                    <BattleCardSlotComponent
                        CardIcon={iconName}
                        backGColor={color}
                        index={idx}
                        isShow={isShow}
                        onPress={handlePress}
                    />
                </Animated.View>
            }
        </View>
    );
});

const shuffleCard = (cards: string[]): string[] => {
    const newCards = [...cards];
    for (let i = newCards.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [newCards[i], newCards[j]] = [newCards[j], newCards[i]]; // Swap elements
    }
    return newCards;
};

const cardIDPool1: string[] = ['UT1', 'UT2', 'UT3', 'RND1', 'RND2'];
const cardIDPool2: string[] = ['OFF', 'DEF', 'TEC', 'SPD', 'SPT'];

const BattleIndex = memo(() => {
    const { teamID, dificulty } = useLocalSearchParams();
    const isBusyRef = useRef(false);

    const isEndRef = useRef(false);
    const [showResult, setShowResult] = useState(false);
    const [finishInit, setFinishInit] = useState<boolean>(false);

    const [isReady, setIsReady] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [roundCount, setRoundCount] = useState(0);
    const levelRCountRef = useRef(1);
    const [messageModal, setMessageModal] = useState('');

    const [currPlayer, setCurrPlayer] = useState(0);
    const currPlayerRef = useRef(0);

    const prevSlotIndex = useRef(-1);

    const [totalAsset, setTotalAsset] = useState(60);
    const [currAsset, setCurrAsset] = useState(0);

    const [playerScore, setPlayerScore] = useState(60);
    const [playerStats, setPlayerStat] = useState<number[]>([0, 0, 0, 0, 0]);
    const [playerUnits, setPlayerUnits] = useState<BattleUnit[]>([]);

    const [enemyScore, setEnemyScore] = useState(60);
    const [enemyStats, setEnemyStats] = useState<number[]>([0, 0, 0, 0, 0]);
    const [enemyUnits, setEnemyUnits] = useState<BattleUnit[]>([]);

    const cardPoolRef = useRef<string[]>([]);
    const [cardSlots, setCardSlots] = useState<BattleCardSlotType[]>([]);
    const [slotAreaHeight, setSlotAreaHeight] = useState(0);
    const slot_height = slotAreaHeight / 2;

    const [pSummaryTeam, setPSummaryTeam] = useState<SummaryTeamType>({
        stats: [0, 0, 0, 0, 0],
        units: [{
            imgURI: '',
            level: 0,
            element1: 0,
            element2: 0
        },
        {
            imgURI: '',
            level: 0,
            element1: 0,
            element2: 0
        },
        {
            imgURI: '',
            level: 0,
            element1: 0,
            element2: 0
        }]
    });

    const [eSummaryTeam, setESummaryTeam] = useState<SummaryTeamType>({
        stats: [0, 0, 0, 0, 0],
        units: [{
            imgURI: '',
            level: 0,
            element1: 0,
            element2: 0
        },
        {
            imgURI: '',
            level: 0,
            element1: 0,
            element2: 0
        },
        {
            imgURI: '',
            level: 0,
            element1: 0,
            element2: 0
        }]
    });

    const [prevUnitURI, setPrevUnitURI] = useState<string>('');
    const [nextUnitURI, setNextUnitURI] = useState<string>('');
    const [playEvolveAnimation, setPlayEvolveAnimation] = useState<boolean>(false);

    const resultHeaders = useRef<string[]>(['Card Match', 'Unit Level', 'Diff Score']);
    const resultValues = useRef<number[]>([0, 3, 0]);

    const currCardMatchRef = useRef<number>(0);

    const showedCards = useRef<ShowedCardType[]>([]);

    const startGameClick = useCallback(() => {
        setFinishInit(false);
        setTimeout(() => {
            setIsReady(true);
            NextRound();
            setTimeout(() => {
                setCurrPlayer(1);
            }, 1000);
        }, 1000);
    }, [finishInit]);

    const NextRound = useCallback(() => {
        setRoundCount((prev) => prev + 1);
        currCardMatchRef.current = 0;
        showedCards.current = [];
    }, []);

    const EnemyMove = useCallback(() => {
        let idx1 = 0;
        let idx2 = 0;

        let chance = 0;
        switch (dificulty) {
            case 'medium':
                chance = 25;
                break;
            case 'hard':
                chance = 50;
                break;
            case 'very hard':
                chance = 75;
                break;
            case 'insane':
                chance = 100;
                break;
        }
        const isCheck = chance >= getRandomInt(1, 100);

        if (!isCheck) {
            let playable = cardSlots.filter(q => q.cardID !== '');
            const choice1 = playable[getRandomInt(0, playable.length - 1)];
            idx1 = choice1.index;

            let playable2 = playable.filter(q => q.index !== idx1);
            const choice2 = playable2[getRandomInt(0, playable2.length - 1)];
            idx2 = choice2.index;
        }
        else {
            const matchCards = showedCards.current.filter(q => q.val2 !== -1);

            if (matchCards.length > 0 && isCheck) {
                const pair = matchCards[getRandomInt(0, matchCards.length - 1)];
                idx1 = pair.val1;
                idx2 = pair.val2;
            } else {
                const playable = cardSlots.filter(q => q.cardID !== '');
                const unseen = playable.filter(q => !showedCards.current.some(m => m.key === q.cardID));

                const pool1 = unseen.length > 0 ? unseen : playable;
                const choice1 = pool1[getRandomInt(0, pool1.length - 1)];
                idx1 = choice1.index;

                const memory = showedCards.current.find(q => q.key === choice1.cardID);

                if (memory && memory.val1 !== idx1) {
                    idx2 = memory.val1;
                } else {
                    const pool2 = playable.filter(q => q.index !== idx1);
                    if (pool2.length > 0) {
                        idx2 = pool2[getRandomInt(0, pool2.length - 1)].index;
                    }
                }
            }
        }

        setCardSlots(prev => prev.map(s => s.index === idx1 ? { ...s, isShow: true } : s));
        prevSlotIndex.current = idx1;

        setTimeout(() => {
            setCardSlots(prev => prev.map(s => s.index === idx2 ? { ...s, isShow: true } : s));
            setTimeout(() => {
                checkCardsRef.current(idx2);
            }, 500);
        }, 1000);
    }, [cardSlots]);

    const EnemyMoveRef = useRef(EnemyMove);
    useEffect(() => {
        EnemyMoveRef.current = EnemyMove;
    }, [EnemyMove])

    const endTurn = useCallback((isChangePlayer: boolean) => {
        if (isEndRef.current) return;
        prevSlotIndex.current = -1;

        let delayTime = 500;
        if (isChangePlayer) {
            let targetPlayer = currPlayerRef.current === 1 ? 2 : 1;
            currPlayerRef.current = targetPlayer;

            delayTime = 2000;
            setCurrPlayer(targetPlayer);
        }

        if (currCardMatchRef.current >= 5) {
            setTimeout(() => {
                NextRound();
            }, 500);
            delayTime = 2000;
        }

        setTimeout(() => {
            if (currPlayerRef.current === 2) {
                EnemyMoveRef.current();
            }
            else {
                isBusyRef.current = false;
            }
        }, delayTime);
    }, [NextRound]);

    const initUnits = useCallback(async (units: BattleUnit[]): Promise<BattleUnit[]> => {
        for (let i = 0; i < units.length; i++) {
            for (let j = 0; j < units[i].paths.length; j++) {
                units[i].paths[j].imgURL = await getUnitCardImagePath(
                    units[i].paths[j].origin,
                    units[i].paths[j].unitCode,
                    units[i].paths[j].imageTypeNumber
                );
                setCurrAsset((prev) => prev + 1);
            }
            units[i].imgURL = units[i].paths[0].imgURL;
            units[i].currLevel = 1;
            units[i].unitCode = units[i].paths[0].unitCode;
            units[i].imgURL = units[i].paths[0].imgURL;
            units[i].offense = 1 + units[i].paths[0].offense;
            units[i].defense = 1 + units[i].paths[0].defense;
            units[i].technique = 1 + units[i].paths[0].technique;
            units[i].speed = 1 + units[i].paths[0].speed;
            units[i].spirit = 1 + units[i].paths[0].spirit;
            units[i].elementID1 = units[i].paths[0].elementID1;
            units[i].elementID2 = units[i].paths[0].elementID2;
        }
        return units;
    }, []);

    const init = useCallback(async () => {
        setFinishInit(false);
        setIsReady(false);
        setIsLoading(true);
        setRoundCount(0);
        setCurrAsset(0);
        setTotalAsset(60);
        levelRCountRef.current = 0;

        try {
            const id = Array.isArray(teamID) ? teamID[0] : teamID;

            const resPlayerUnits = await battleGetPlayerTeamUnits(id);
            if (!resPlayerUnits.success) {
                return;
            }

            const resEnemyUnits = await battleGetRandomEnemyBattleUnits
                (resPlayerUnits.data.map(u => u.level), resPlayerUnits.data.map(u => u.paths.at(-1)?.unitLevel ?? 1));
            if (!resEnemyUnits.success) {
                return;
            }

            let totalPaths = resPlayerUnits.data.reduce((acc, unit) => acc + unit.paths.length, 0);
            setTotalAsset(totalPaths * 2);

            const updatedPlayerUnits = await initUnits(resPlayerUnits.data);
            const updatedEnemyUnits = await initUnits(resEnemyUnits.data);


            const tempPSummaryTeam: SummaryTeamType = {
                stats: [0, 0, 0, 0, 0],
                units: [{
                    imgURI: '',
                    level: 0,
                    element1: 0,
                    element2: 0
                },
                {
                    imgURI: '',
                    level: 0,
                    element1: 0,
                    element2: 0
                },
                {
                    imgURI: '',
                    level: 0,
                    element1: 0,
                    element2: 0
                }]
            };

            const tempESummaryTeam: SummaryTeamType = {
                stats: [0, 0, 0, 0, 0],
                units: [{
                    imgURI: '',
                    level: 0,
                    element1: 0,
                    element2: 0
                },
                {
                    imgURI: '',
                    level: 0,
                    element1: 0,
                    element2: 0
                },
                {
                    imgURI: '',
                    level: 0,
                    element1: 0,
                    element2: 0
                }]
            };

            const tempCurrPStats = [0, 0, 0, 0, 0];
            const tempCurrEStats = [0, 0, 0, 0, 0];

            for (let i = 0; i < updatedPlayerUnits.length; i++) {
                tempCurrPStats[0] += updatedPlayerUnits[i].offense;
                tempCurrPStats[1] += updatedPlayerUnits[i].defense;
                tempCurrPStats[2] += updatedPlayerUnits[i].technique;
                tempCurrPStats[3] += updatedPlayerUnits[i].speed;
                tempCurrPStats[4] += updatedPlayerUnits[i].spirit;

                tempCurrEStats[0] += updatedEnemyUnits[i].offense;
                tempCurrEStats[1] += updatedEnemyUnits[i].defense;
                tempCurrEStats[2] += updatedEnemyUnits[i].technique;
                tempCurrEStats[3] += updatedEnemyUnits[i].speed;
                tempCurrEStats[4] += updatedEnemyUnits[i].spirit;

                for (let j = 0; j < updatedPlayerUnits[i].paths.length; j++) {
                    tempPSummaryTeam.stats[0] += updatedPlayerUnits[i].paths[j].offense;
                    tempPSummaryTeam.stats[1] += updatedPlayerUnits[i].paths[j].defense;
                    tempPSummaryTeam.stats[2] += updatedPlayerUnits[i].paths[j].technique;
                    tempPSummaryTeam.stats[3] += updatedPlayerUnits[i].paths[j].speed;
                    tempPSummaryTeam.stats[4] += updatedPlayerUnits[i].paths[j].spirit;

                    tempPSummaryTeam.units[i].imgURI = updatedPlayerUnits[i].paths[j].imgURL;
                    tempPSummaryTeam.units[i].element1 = updatedPlayerUnits[i].paths[j].elementID1;
                    tempPSummaryTeam.units[i].element2 = updatedPlayerUnits[i].paths[j].elementID2;
                }

                for (let j = 0; j < updatedEnemyUnits[i].paths.length; j++) {
                    tempESummaryTeam.stats[0] += updatedEnemyUnits[i].paths[j].offense;
                    tempESummaryTeam.stats[1] += updatedEnemyUnits[i].paths[j].defense;
                    tempESummaryTeam.stats[2] += updatedEnemyUnits[i].paths[j].technique;
                    tempESummaryTeam.stats[3] += updatedEnemyUnits[i].paths[j].speed;
                    tempESummaryTeam.stats[4] += updatedEnemyUnits[i].paths[j].spirit;

                    tempESummaryTeam.units[i].imgURI = updatedEnemyUnits[i].paths[j].imgURL;
                    tempESummaryTeam.units[i].element1 = updatedEnemyUnits[i].paths[j].elementID1;
                    tempESummaryTeam.units[i].element2 = updatedEnemyUnits[i].paths[j].elementID2;
                }
                tempPSummaryTeam.units[i].level = updatedPlayerUnits[i].level;
                tempESummaryTeam.units[i].level = updatedEnemyUnits[i].level;

                let levelstats = updatedPlayerUnits[i].level * 1;
                tempPSummaryTeam.stats[0] += levelstats;
                tempPSummaryTeam.stats[1] += levelstats;
                tempPSummaryTeam.stats[2] += levelstats;
                tempPSummaryTeam.stats[3] += levelstats;
                tempPSummaryTeam.stats[4] += levelstats;

                levelstats = updatedEnemyUnits[i].level * 1;
                tempESummaryTeam.stats[0] += levelstats;
                tempESummaryTeam.stats[1] += levelstats;
                tempESummaryTeam.stats[2] += levelstats;
                tempESummaryTeam.stats[3] += levelstats;
                tempESummaryTeam.stats[4] += levelstats;

            }

            setPSummaryTeam(tempPSummaryTeam);
            setESummaryTeam(tempESummaryTeam);

            let slots: BattleCardSlotType[] = [];
            for (let i = 0; i < 10; i++) {
                slots.push({
                    index: i,
                    cardID: '',
                    isShow: false
                });
            }

            totalPaths -= 3;
            if (totalPaths > 0) {
                levelRCountRef.current = Math.max(Math.floor((totalPaths + 4) / 5), 1);
            }

            setPlayerScore(60);
            setEnemyScore(60);
            setPlayerStat(tempCurrPStats);
            setEnemyStats(tempCurrEStats);
            setPlayerUnits(updatedPlayerUnits);
            setEnemyUnits(updatedEnemyUnits);

            currPlayerRef.current = 1;
            setCardSlots(slots);

            setTimeout(() => {
                setFinishInit(true);
            }, 1000);
        }
        finally {
            setTimeout(() => {
                setIsLoading(false);
            }, 1000);
        }
    }, []);

    useFocusEffect(
        useCallback(() => {
            init();
        }, [])
    );

    const clearBoard = useCallback(() => {
        setCardSlots((prev) => prev.map(slot => {
            return {
                ...slot,
                cardID: ''
            };
        }));
    }, []);

    const newRound = useCallback(() => {
        let cards: string[] = [];
        for (let i = 0; i < cardPoolRef.current.length; i++) {
            cards.push(cardPoolRef.current[i]);
            cards.push(cardPoolRef.current[i]);
        }

        cards = shuffleCard(cards);

        setCardSlots((prev) =>
            prev.map((slot, index) => {
                return {
                    ...slot,
                    cardID: cards[index],
                    isShow: false
                }
            })
        );
    }, []);

    const setCardPool = useCallback((cardIDS: string[]) => {
        cardPoolRef.current = [];
        for (let i = 0; i < cardIDS.length; i++) {
            cardPoolRef.current.push(cardIDS[i]);
        }
    }, []);

    useEffect(() => {
        clearBoard();
        if (roundCount <= levelRCountRef.current) setCardPool(cardIDPool1);
        else setCardPool(cardIDPool2);
        setTimeout(() => {
            newRound();
        }, 500);
    }, [roundCount, newRound, clearBoard]);

    const onCloseEvolveModal = useCallback(() => {
        setPrevUnitURI('');
        setNextUnitURI('');
        setPlayEvolveAnimation(false);
        endTurn(false);
    }, [endTurn]);

    const onCardSlotPress = useCallback((index: number) => {
        if (isBusyRef.current || isEndRef.current) return;
        isBusyRef.current = true;

        if (prevSlotIndex.current === index) {
            isBusyRef.current = false;
            return;
        }

        setCardSlots((prev) => prev.map(slot => {
            return slot.index === index ? { ...slot, isShow: true } : slot;
        }));

        if (prevSlotIndex.current !== -1) {
            setTimeout(() => {
                checkCardsRef.current(index);
            }, 500);
        }
        else {
            prevSlotIndex.current = index;
            isBusyRef.current = false;
        }
    }, []);

    useEffect(() => {
        setMessageModal(`${currPlayer === 1 ? 'PLAYER' : 'ENEMY'} TURN`);
        setTimeout(() => {
            setMessageModal('');
        }, 1500);
    }, [currPlayer]);

    const unitCardMatch = useCallback((index: number) => {
        const targetUnit = currPlayerRef.current === 1 ? playerUnits[index] : enemyUnits[index];
        let offense = 0;
        let defense = 0;
        let technique = 0;
        let speed = 0;
        let spirit = 0;

        const currLevel = targetUnit.currLevel;
        const nextLevel = Math.min(targetUnit.paths.length, currLevel + 1);
        let isEndTurn = true;
        if (currLevel !== nextLevel) {
            const nextUnit = targetUnit.paths[targetUnit.currLevel];
            if (nextUnit) {
                setPrevUnitURI(targetUnit.imgURL);
                setNextUnitURI(nextUnit.imgURL);
                setPlayEvolveAnimation(true);
                isEndTurn = false;

                targetUnit.imgURL = nextUnit.imgURL;
                targetUnit.elementID1 = nextUnit.elementID1;
                targetUnit.elementID2 = nextUnit.elementID2;
                offense += nextUnit.offense;
                defense += nextUnit.defense;
                technique += nextUnit.technique;
                speed += nextUnit.speed;
                spirit += nextUnit.spirit;
            }
            if (currPlayerRef.current === 1) {
                resultValues.current[1]++;
                setPlayerScore((prev) => prev + 20);
            } else {
                setEnemyScore((prev) => prev + 20);
            }
        } else {
            endTurn(false);
            return;
        }

        const stats = currPlayerRef.current === 1 ? [...playerStats] : [...enemyStats];
        stats[0] += offense;
        stats[1] += defense;
        stats[2] += technique;
        stats[3] += speed;
        stats[4] += spirit;

        if (currPlayerRef.current === 1) {
            setPlayerUnits((prev) => prev.map((u, i) => {
                return i !== index ? u : {
                    ...u,
                    imgURL: targetUnit.imgURL,
                    currLevel: nextLevel,
                    offense: u.offense + offense,
                    defense: u.defense + defense,
                    technique: u.technique + technique,
                    speed: u.speed + speed,
                    spirit: u.spirit + spirit
                };
            }));

            setPlayerStat(stats);
        }
        else {
            setEnemyUnits((prev) => prev.map((u, i) => {
                return i !== index ? u : {
                    ...u,
                    imgURL: targetUnit.imgURL,
                    currLevel: nextLevel,
                    offense: u.offense + offense,
                    defense: u.defense + defense,
                    technique: u.technique + technique,
                    speed: u.speed + speed,
                    spirit: u.spirit + spirit
                };
            }));

            setEnemyStats(stats);
        }

        if (isEndTurn) endTurn(false);
    }, [playerUnits, enemyUnits, playerStats, enemyStats]);

    const scoreMatch = useCallback((index: number) => {
        const val = currPlayerRef.current === 1 ? playerStats[index] : enemyStats[index];

        if (currPlayerRef.current === 1) {
            setEnemyScore((prev) => prev - val);
        } else {
            setPlayerScore((prev) => prev - val);
        }
    }, [playerStats, enemyStats]);

    const handleMatchCard = useCallback((cardID: string) => {
        if (currPlayerRef.current === 1) resultValues.current[0]++;

        currCardMatchRef.current++;

        switch (cardID) {
            case "UT1":
                unitCardMatch(0);
                return;
            case "UT2":
                unitCardMatch(1);
                return;
            case "UT3":
                unitCardMatch(2);
                return;
            case "OFF":
                scoreMatch(0);
                break;
            case "DEF":
                scoreMatch(1);
                break;
            case "TEC":
                scoreMatch(2);
                break;
            case "SPD":
                scoreMatch(3);
                break;
            case "SPT":
                scoreMatch(4);
                break;
            case "RND1":
            case "RND2":
                unitCardMatch(getRandomInt(0, 2));
                return;
        }
        setTimeout(() => {
            endTurn(false);
        }, 500);
    }, [endTurn, unitCardMatch, scoreMatch]);

    const checkCards = useCallback((slotID: number) => {
        const card1 = cardSlots.find(q => q.index === prevSlotIndex.current);
        const card2 = cardSlots.find(q => q.index === slotID);

        if (!card1 || !card2) {
            endTurn(false);
            return;

        }

        if (card1.cardID !== card2.cardID) {
            const showed1 = showedCards.current.find(q => q.key === card1.cardID);
            if (!showed1) {
                showedCards.current.push({
                    key: card1.cardID,
                    val1: card1.index,
                    val2: -1
                });
            }
            else if (showed1.val2 === -1 && showed1.val1 !== card1.index) {
                showed1.val2 = card1.index;
            }

            const showed2 = showedCards.current.find(q => q.key === card2.cardID);
            if (!showed2) {
                showedCards.current.push({
                    key: card2.cardID,
                    val1: card2.index,
                    val2: -1
                });
            }
            else if (showed2.val2 === -1 && showed2.val1 !== card2.index) {
                showed2.val2 = card2.index;
            }

            setCardSlots((prev) => {
                return prev.map((slot, idx) => {
                    return card1.index !== idx && card2.index !== idx ? slot : {
                        ...slot,
                        isShow: false
                    };
                });
            });
            endTurn(true);
        }
        else {
            const index = showedCards.current.findIndex(q => q.key === card1.cardID);
            if (index !== -1) {
                showedCards.current.splice(index, 1);
            }

            setCardSlots((prev) => {
                return prev.map(slot => {
                    return slot.index !== card1.index && slot.index !== card2.index ? slot :
                        {
                            ...slot,
                            isShow: false,
                            cardID: ''
                        };
                });
            });
            handleMatchCard(card1!.cardID);
        }
    }, [cardSlots, handleMatchCard, endTurn]);

    const checkCardsRef = useRef(checkCards);
    useEffect(() => {
        checkCardsRef.current = checkCards;
    }, [checkCards]);

    const onContinuePress = useCallback(() => {
        setShowResult(false);

        if (router.canGoBack()) {
            router.dismissAll();
        }

        router.replace({
            pathname: '/main-menu'
        });
    }, []);

    const renderSlotItem: ListRenderItem<BattleCardSlotType> = useCallback(({ item }) => {
        return (
            <CardSlotComponent
                cardID={item.cardID}
                h={slot_height}
                idx={item.index}
                isShow={item.isShow}
                onPress={onCardSlotPress}
            />
        )
    }, [slot_height, onCardSlotPress]);

    useEffect(() => {
        if (playerScore <= 0 || enemyScore <= 0) {
            if (playerScore > enemyScore) resultValues.current[2] = playerScore - enemyScore;
            setShowResult(true);
            isEndRef.current = true;
        }
    }, [playerScore, enemyScore]);

    const [showSurrenderDialog, setShowSurrenderDialog] = useState<boolean>(false);
    const onSurrenderClick = useCallback(() => {
        setShowSurrenderDialog(true);
    }, []);
    const onCloseSurrender = useCallback(() => {
        setShowSurrenderDialog(false);
    }, []);
    const onSurrender = useCallback(() => {
        setShowSurrenderDialog(false);
        onContinuePress();
    }, []);

    return (
        <View style={[gs.full_size]}>
            {finishInit &&
                <Animated.View entering={FadeIn} style={[gs.full_size]}>
                    <Animated.View entering={SlideInUp} exiting={SlideOutUp} style={[gs.f4, gs.full_size, gs.p5, { backgroundColor: PlayerColor.Player }]}>
                        <View style={[gs.f1, gs.full_size, gs.all_center]}>
                            <Text style={[{ color: 'white' }, gs.fontM]}>PLAYER</Text>
                        </View>
                        <View style={[gs.f4, gs.full_size, gs.p5, gs.border_card, { backgroundColor: 'white' }]}>
                            <View style={[gs.f2, gs.full_size, gs.column]}>
                                <View key={`pu-${0}`} style={[gs.f1, gs.px5]}>
                                    <CardComponent
                                        imgURL={pSummaryTeam.units[0].imgURI}
                                        footerText=''
                                        elements={[pSummaryTeam.units[0].element1, pSummaryTeam.units[0].element2]} />
                                </View>
                                <View key={`pu-${1}`} style={[gs.f1, gs.px5]}>
                                    <CardComponent
                                        imgURL={pSummaryTeam.units[1].imgURI}
                                        footerText=''
                                        elements={[pSummaryTeam.units[1].element1, pSummaryTeam.units[1].element2]} />
                                </View>
                                <View key={`pu-${2}`} style={[gs.f1]}>
                                    <CardComponent
                                        imgURL={pSummaryTeam.units[2].imgURI}
                                        footerText=''
                                        elements={[pSummaryTeam.units[2].element1, pSummaryTeam.units[2].element2]} />
                                </View>
                            </View>
                            <View style={[gs.f1, gs.full_size, gs.column]}>
                                {pSummaryTeam.stats.map((item, index) => {
                                    return (
                                        <View key={`es-${index}`} style={[gs.f1, gs.p5]} >
                                            <View style={[gs.border_card, gs.full_size, gs.p5, {
                                                backgroundColor:
                                                    index === 0 ? StatColor.offense :
                                                        index === 1 ? StatColor.defense :
                                                            index === 2 ? StatColor.technique :
                                                                index === 3 ? StatColor.speed :
                                                                    StatColor.spirit
                                            }]} >
                                                <View style={[gs.full_size, gs.all_center, gs.border_card, { backgroundColor: 'white' }]}>
                                                    <Text style={[gs.fontM]}>{item}</Text>
                                                </View>
                                            </View>
                                        </View>
                                    )
                                })}
                            </View>
                        </View>
                    </Animated.View>
                    <Animated.View entering={FadeIn.delay(1000)} exiting={FadeOut} style={[gs.f1, gs.all_center]}>
                        <Pressable onPress={startGameClick} style={[gs.full_size, gs.all_center, gs.column]}>
                            <View style={[gs.f2, gs.all_center]}><Text style={[gs.fontM]} >PRESS TO </Text></View>
                            <View style={[gs.f1, gs.all_center]}><PowerIcon color={'red'} size={scaleMin(22)} /></View>
                            <View style={[gs.f2, gs.all_center]}><Text style={[gs.fontM]}> START</Text></View>
                        </Pressable>
                    </Animated.View>
                    <Animated.View entering={SlideInDown} exiting={SlideOutDown} style={[gs.f4, gs.full_size, gs.p5, { backgroundColor: PlayerColor.Enemy }]}>
                        <View style={[gs.f4, gs.full_size, gs.p5, gs.border_card, { backgroundColor: 'white' }]}>
                            <View style={[gs.f1, gs.full_size, gs.column]}>
                                {eSummaryTeam.stats.map((item, index) => {
                                    return (
                                        <View key={`ps-${index}`} style={[gs.f1, gs.p5]} >
                                            <View style={[gs.border_card, gs.full_size, gs.p5, {
                                                backgroundColor:
                                                    index === 0 ? StatColor.offense :
                                                        index === 1 ? StatColor.defense :
                                                            index === 2 ? StatColor.technique :
                                                                index === 3 ? StatColor.speed :
                                                                    StatColor.spirit
                                            }]} >
                                                <View style={[gs.full_size, gs.all_center, gs.border_card, { backgroundColor: 'white' }]}>
                                                    <Text style={[gs.fontM]}>{item}</Text>
                                                </View>
                                            </View>
                                        </View>
                                    )
                                })}
                            </View>
                            <View style={[gs.f2, gs.full_size, gs.column]}>
                                <View key={`eu-${0}`} style={[gs.f1, gs.px5]}>
                                    <CardComponent
                                        imgURL={eSummaryTeam.units[0].imgURI}
                                        footerText=''
                                        elements={[eSummaryTeam.units[0].element1, eSummaryTeam.units[0].element2]} />
                                </View>
                                <View key={`eu-${1}`} style={[gs.f1, gs.px5]}>
                                    <CardComponent
                                        imgURL={eSummaryTeam.units[1].imgURI}
                                        footerText=''
                                        elements={[eSummaryTeam.units[1].element1, eSummaryTeam.units[1].element2]} />
                                </View>
                                <View key={`eu-${2}`} style={[gs.f1]}>
                                    <CardComponent
                                        imgURL={eSummaryTeam.units[2].imgURI}
                                        footerText=''
                                        elements={[eSummaryTeam.units[2].element1, eSummaryTeam.units[2].element2]} />
                                </View>
                            </View>
                        </View>
                        <View style={[gs.f1, gs.full_size, gs.all_center]}>
                            <Text style={[{ color: 'white' }, gs.fontM]}>ENEMY</Text>
                        </View>
                    </Animated.View>
                </Animated.View>
            }
            {isReady &&
                <Animated.View entering={FadeIn} style={gs.full_size}>
                    <View style={[gs.f1, gs.header, gs.full_size, gs.column, gs.border_bottom]}>
                        <View style={[gs.f1, gs.all_center]}>
                            <Text style={[gs.fontM, gs.text_center]}>ROUND</Text>
                            <Text style={[gs.fontM]}>{roundCount}/{levelRCountRef.current}</Text>
                        </View>
                        <View style={[gs.f2, gs.all_center, { paddingBottom: scaleMin(5), paddingTop: scaleMin(5) }]}>
                            <View style={[gs.f1, gs.all_center, gs.full_size]}>
                                <Text style={[gs.fontM]}>
                                    {roundCount <= levelRCountRef.current ? 'LEVEL STAGE ROUND' : 'BATTLE STAGE ROUND'}
                                </Text>
                            </View>
                            {currPlayer === 1 &&
                                <Animated.View
                                    entering={FlipInEasyX.delay(500)}
                                    exiting={FlipOutEasyX}
                                    style={[gs.full_size, gs.f1, gs.all_center, gs.radius, { backgroundColor: PlayerColor.Player }]}>
                                    <Text style={[{ color: 'white' }, gs.fontM]}>PLAYER TURN</Text>
                                </Animated.View>
                            }
                            {currPlayer === 2 &&
                                <Animated.View
                                    entering={FlipInEasyX.delay(500)}
                                    exiting={FlipOutEasyX}
                                    style={[gs.full_size, gs.f1, gs.all_center, gs.radius, { backgroundColor: PlayerColor.Enemy }]}>
                                    <Text style={[{ color: 'white' }, gs.fontM]}>ENEMY TURN</Text>
                                </Animated.View>
                            }
                        </View>
                        <Pressable style={[gs.f1, gs.all_center]}
                            accessibilityLabel="button"
                            onPress={onSurrenderClick}>
                            <LogOutIcon />
                        </Pressable>
                    </View>
                    <View style={[gs.f2, gs.full_size]}>
                        <View style={[gs.f2, gs.column, gs.p5]}>
                            <View style={[gs.f4, gs.px5]}>
                                <View style={[gs.f1, gs.all_center, gs.border_card, { backgroundColor: PlayerColor.Player }]}>
                                    <Text style={[{ color: 'white' }, gs.fontM]}>PLAYER</Text>
                                </View>
                                <View style={[gs.f2, gs.all_center, gs.column]}>
                                    <AnimatedNumbers
                                        fontStyle={[gs.fontM]}
                                        animationDuration={1000}
                                        animateToNumber={playerScore}
                                    />
                                </View>
                            </View>
                            <View style={[gs.f2, gs.all_center, gs.px5]}>
                                <CardComponent
                                    imgURL={playerUnits[0].imgURL}
                                    footerText=''
                                    elements={[playerUnits[0].elementID1, playerUnits[0].elementID2]} />
                            </View>
                            <View style={[gs.f2, gs.all_center, gs.px5]}>
                                <CardComponent
                                    imgURL={playerUnits[1].imgURL}
                                    footerText=''
                                    elements={[playerUnits[1].elementID1, playerUnits[1].elementID2]} />
                            </View>
                            <View style={[gs.f2, gs.all_center]}>
                                <CardComponent
                                    imgURL={playerUnits[2].imgURL}
                                    footerText=''
                                    elements={[playerUnits[2].elementID1, playerUnits[2].elementID2]} />
                            </View>
                        </View>
                        <View style={[gs.f1, gs.column, styles.player_stat_bar]}>
                            <View style={[gs.f1, gs.p5, styles.border_right, { backgroundColor: StatColor.offense }]}>
                                <View style={[gs.all_center, gs.border_card, gs.full_size, { backgroundColor: 'white' }]}>
                                    <AnimatedNumbers
                                        fontStyle={[gs.fontM]}
                                        animationDuration={1000} animateToNumber={playerStats[0]} />
                                </View>
                            </View>
                            <View style={[gs.f1, gs.p5, styles.border_right, { backgroundColor: StatColor.defense }]}>
                                <View style={[gs.all_center, gs.border_card, gs.full_size, { backgroundColor: 'white' }]}>
                                    <AnimatedNumbers
                                        fontStyle={[gs.fontM]}
                                        animationDuration={1000} animateToNumber={playerStats[1]} />
                                </View>
                            </View>
                            <View style={[gs.f1, gs.p5, styles.border_right, { backgroundColor: StatColor.technique }]}>
                                <View style={[gs.all_center, gs.border_card, gs.full_size, { backgroundColor: 'white' }]}>
                                    <AnimatedNumbers
                                        fontStyle={[gs.fontM]}
                                        animationDuration={1000} animateToNumber={playerStats[2]} />
                                </View>
                            </View>
                            <View style={[gs.f1, gs.p5, styles.border_right, { backgroundColor: StatColor.speed }]}>
                                <View style={[gs.all_center, gs.border_card, gs.full_size, { backgroundColor: 'white' }]}>
                                    <AnimatedNumbers
                                        fontStyle={[gs.fontM]}
                                        animationDuration={1000} animateToNumber={playerStats[3]} />
                                </View>
                            </View>
                            <View style={[gs.f1, gs.p5, styles.border_right, { backgroundColor: StatColor.spirit }]}>
                                <View style={[gs.all_center, gs.border_card, gs.full_size, { backgroundColor: 'white' }]}>
                                    <AnimatedNumbers
                                        fontStyle={[gs.fontM]}
                                        animationDuration={1000} animateToNumber={playerStats[4]} />
                                </View>
                            </View>
                        </View>
                    </View>
                    <View style={[gs.f5, gs.p5, gs.border_bottom, gs.border_top]}>
                        <View style={gs.full_size}
                            onLayout={(e) => setSlotAreaHeight(e.nativeEvent.layout.height)}>
                            {slotAreaHeight > 0 &&
                                <FlatList
                                    data={cardSlots}
                                    renderItem={renderSlotItem}
                                    numColumns={5}
                                    keyExtractor={(item) => item.index.toString()} />
                            }
                        </View>
                    </View>
                    <View style={[gs.f2, gs.full_size]}>
                        <View style={[gs.f1, gs.column, styles.enemy_stat_bar]}>
                            <View style={[gs.f1, gs.p5, styles.border_right, { backgroundColor: StatColor.offense }]}>
                                <View style={[gs.all_center, gs.border_card, gs.full_size, { backgroundColor: 'white' }]}>
                                    <AnimatedNumbers
                                        fontStyle={[gs.fontM]}
                                        animationDuration={1000} animateToNumber={enemyStats[0]} />
                                </View>
                            </View>
                            <View style={[gs.f1, gs.p5, styles.border_right, { backgroundColor: StatColor.defense }]}>
                                <View style={[gs.all_center, gs.border_card, gs.full_size, { backgroundColor: 'white' }]}>
                                    <AnimatedNumbers
                                        fontStyle={[gs.fontM]}
                                        animationDuration={1000} animateToNumber={enemyStats[1]} />
                                </View>
                            </View>
                            <View style={[gs.f1, gs.p5, styles.border_right, { backgroundColor: StatColor.technique }]}>
                                <View style={[gs.all_center, gs.border_card, gs.full_size, { backgroundColor: 'white' }]}>
                                    <AnimatedNumbers
                                        fontStyle={[gs.fontM]}
                                        animationDuration={1000} animateToNumber={enemyStats[2]} />
                                </View>
                            </View>
                            <View style={[gs.f1, gs.p5, styles.border_right, { backgroundColor: StatColor.speed }]}>
                                <View style={[gs.all_center, gs.border_card, gs.full_size, { backgroundColor: 'white' }]}>
                                    <AnimatedNumbers
                                        fontStyle={[gs.fontM]}
                                        animationDuration={1000} animateToNumber={enemyStats[3]} />
                                </View>
                            </View>
                            <View style={[gs.f1, gs.p5, styles.border_right, { backgroundColor: StatColor.spirit }]}>
                                <View style={[gs.all_center, gs.border_card, gs.full_size, { backgroundColor: 'white' }]}>
                                    <AnimatedNumbers
                                        fontStyle={[gs.fontM]}
                                        animationDuration={1000} animateToNumber={enemyStats[4]} />
                                </View>
                            </View>
                        </View>
                        <View style={[gs.f2, gs.column, gs.p5]}>
                            <View style={[gs.f4, gs.px5]}>
                                <View style={[gs.f1, gs.all_center, gs.border_card, { backgroundColor: PlayerColor.Enemy }]}>
                                    <Text style={[{ color: 'white' }, gs.fontM]}>ENEMY</Text>
                                </View>
                                <View style={[gs.f2, gs.all_center, gs.column]}>
                                    <AnimatedNumbers
                                        fontStyle={[gs.fontM]}
                                        animationDuration={1000}
                                        animateToNumber={enemyScore}
                                    />
                                </View>
                            </View>
                            <View style={[gs.f2, gs.all_center, gs.px5]}>
                                <CardComponent
                                    imgURL={enemyUnits[0].imgURL}
                                    footerText=''
                                    elements={[enemyUnits[0].elementID1, enemyUnits[0].elementID2]} />
                            </View>
                            <View style={[gs.f2, gs.all_center, gs.px5]}>
                                <CardComponent
                                    imgURL={enemyUnits[1].imgURL}
                                    footerText=''
                                    elements={[enemyUnits[1].elementID1, enemyUnits[1].elementID2]} />
                            </View>
                            <View style={[gs.f2, gs.all_center, gs.px5]}>
                                <CardComponent
                                    imgURL={enemyUnits[2].imgURL}
                                    footerText=''
                                    elements={[enemyUnits[2].elementID1, enemyUnits[2].elementID2]} />
                            </View>
                        </View>
                    </View>
                    <LoadingModalComponent visible={isLoading} />
                </Animated.View>
            }
            {isReady &&
                <ChangeTurnModalComponent playerNumber={currPlayer} message={messageModal} />
            }
            <BattleEvolveModalComponent
                visible={playEvolveAnimation}
                prevURI={prevUnitURI} nextURI={nextUnitURI} onClose={onCloseEvolveModal} />
            <BattleResultModalComponent
                visible={showResult}
                key={new Date().toString()}
                isWin={playerScore > enemyScore}
                values={resultValues.current}
                headers={resultHeaders.current}
                dificulty={
                    playerScore >= enemyScore ?
                        dificulty === 'medium' ? 10 :
                            dificulty === 'hard' ? 25 :
                                dificulty === 'very hard' ? 50 :
                                    dificulty === 'insane' ? 100 : 1
                        : 1
                }
                onContinue={onContinuePress} />
            <ConfirmationModalComponent
                visible={showSurrenderDialog}
                data={{ message: 'Are you sure to surrender ?', noText: 'NO', yesText: 'YES' }}
                onClose={onCloseSurrender}
                onConfirm={onSurrender} />
            <LoadingModalComponent visible={isLoading} message={`LOADING ASSETS ` + currAsset + `/` + totalAsset}></LoadingModalComponent>
        </View>
    );
});

const styles = StyleSheet.create({
    border_right: { borderRightWidth: 1 },
    border_left: { borderLeftWidth: 1 },
    player_stat_bar: { borderTopWidth: 1, borderStyle: 'dashed' },
    enemy_stat_bar: { borderBottomWidth: 1, borderStyle: 'dashed' }
})

export default BattleIndex;