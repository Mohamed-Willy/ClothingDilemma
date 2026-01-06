using UnityEngine;
using UnityEngine.InputSystem;

namespace M_Player
{
    public class PunchState : IState
    {
        public string StateName => "PUNCH";
        AnimatorStateInfo stateInfo;
        PlayerManager player;
        float hitDelay;
        public PunchState(PlayerManager player, float hitDelay)
        {
            this.player = player;
            this.hitDelay = hitDelay;
        }
        public void Begin()
        {
            foreach (var target in player.targets)
            {
                player.IsTargetInsideBox(target, true, false);
            }
            player.m_Animator.CrossFadeInFixedTime("Punch", 0.2f);
        }

        public void Update()
        {
            stateInfo = player.m_Animator.GetCurrentAnimatorStateInfo(0);

            if (!stateInfo.IsName("Punch"))
                return;

            if (stateInfo.normalizedTime >= 1f)
            {
                player.ChangeState(new IdleState(player, hitDelay, 0));
            }
        }
    }
}