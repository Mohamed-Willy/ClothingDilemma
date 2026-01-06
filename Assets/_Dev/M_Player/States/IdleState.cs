using UnityEngine;
using UnityEngine.InputSystem;

namespace M_Player
{
    public class IdleState : IState
    {
        public string StateName => "IDLE";
        PlayerManager player;
        float curTime, hitDelay;
        public IdleState(PlayerManager player, float hitDelay, float curTime)
        {
            this.player = player;
            this.hitDelay = hitDelay;
            this.curTime = curTime;
        }

        public void Begin()
        {
            player.m_Animator.CrossFadeInFixedTime("Idle", 0.5f);
        }

        public void Update()
        {
            curTime += Time.fixedDeltaTime;
            if (Keyboard.current.wKey.isPressed || Keyboard.current.sKey.isPressed || Keyboard.current.aKey.isPressed || Keyboard.current.dKey.isPressed)
            {
                player.ChangeState(new WalkState(player, hitDelay, curTime));
            }
            else if (Mouse.current.leftButton.isPressed && curTime >= hitDelay)
            {
                player.ChangeState(new PunchState(player, hitDelay));
            }
            else if (Mouse.current.rightButton.isPressed && curTime >= hitDelay)
            {
                player.ChangeState(new KickState(player, hitDelay));
            }
        }
    }
}