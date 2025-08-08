import styled from 'styled-components';

interface Interaction {
    trigger: string;
    actionName: string;
}

export const InteractionUI = (interaction: Interaction) => {
    return <InteractionBox>{}</InteractionBox>;
};

const InteractionBox = styled.div`
    position: 'fixed';
    top: '60%';
    left: '50%';
    transform: 'translateX(-50%)';
    pointer-events: 'none';
    z-index: 999;
    text-align: 'center';
`;
