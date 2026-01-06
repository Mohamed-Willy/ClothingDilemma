using UnityEngine;
using UnityEngine.InputSystem;

namespace M_Player
{
    public class WalkState : IState
    {
        public string StateName => "WALK";
        PlayerManager player;
        float x, y;
        float hitDelay, curTime;
        public WalkState(PlayerManager player, float hitDelay, float curTime)
        { 
            this.player = player; 
            this.hitDelay = hitDelay;
            this.curTime = curTime;
        }

        public void Begin()
        {
            player.m_Animator.CrossFadeInFixedTime("Walk", 0.2f);
        }

        public void Update()
        {
            curTime += Time.fixedDeltaTime;
            x = 0f;
            y = 0f;

            if (Keyboard.current.wKey.isPressed) y += 1f;
            if (Keyboard.current.sKey.isPressed) y -= 1f;
            if (Keyboard.current.aKey.isPressed) x -= 1f;
            if (Keyboard.current.dKey.isPressed) x += 1f;

            player.moveInput = new UnityEngine.Vector2(x, y);

            if (x == 0 & y == 0)
            {
                player.moveInput = UnityEngine.Vector2.zero;
                player.ChangeState(new IdleState(player, hitDelay, curTime));
            }
        }
    }
}
