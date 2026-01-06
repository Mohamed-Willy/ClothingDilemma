using UnityEngine;
using UnityEngine.InputSystem;

namespace M_Player
{
    public class KickState : IState
    {
        public string StateName => "KICK";
        AnimatorStateInfo stateInfo;
        PlayerManager player;
        float hitDelay;
        public KickState(PlayerManager player, float hitDelay)
        {
            this.player = player;
            this.hitDelay = hitDelay;
        }

        public void Begin()
        {
            foreach (var target in player.targets)
            {
                player.IsTargetInsideBox(target, false, true);
            }
            player.m_Animator.CrossFadeInFixedTime("Kick", 0.2f);
        }

        public void Update()
        {
            stateInfo = player.m_Animator.GetCurrentAnimatorStateInfo(0);

            if (!stateInfo.IsName("Kick"))
                return;

            if (stateInfo.normalizedTime >= 1f)
            {
                player.ChangeState(new IdleState(player, hitDelay, 0));
            }
        }
    }
}