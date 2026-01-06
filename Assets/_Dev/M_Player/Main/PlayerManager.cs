using Sirenix.OdinInspector;
using System;
using System.Collections.Generic;
using UnityEngine;
using UnityEngine.Events;

namespace M_Player
{
    [HideMonoScript]
    public class PlayerManager : MonoBehaviour
    {
        [Header("Idle Limit")]
        [SerializeField] float allowedIdleTime;
        float currentTime;

        [Header("Range Settings")]
        [SerializeField] Vector3 boxSize;
        [SerializeField] Vector3 boxOffset;

        [Header("Targets")]
        [SerializeField] float hitDelay;
        [SerializeField] Collider m_Collider;
        public List<Collider> targets;

        [Header("Movement")]
        [SerializeField] float moveSpeed = 4f;
        [SerializeField] float turnSpeed = 12f;

        [Header("EndGame")]
        [SerializeField] UnityEvent OnWin;
        [SerializeField] UnityEvent OnLose;

        [ReadOnly] public string m_StateName;

        IState m_State;
        [HideInInspector] public Animator m_Animator;
        [HideInInspector] public Rigidbody m_RigidBody;
        [HideInInspector] public Vector2 moveInput;
        int won, lost;
        void Start()
        {
            won = 0;
            lost = 0;

            M_Socket.SocketManager.Instance.ResetAPI();
            m_Animator = GetComponent<Animator>();
            m_RigidBody = GetComponent<Rigidbody>();
            currentTime = 0;
            ChangeState(new IdleState(this, hitDelay, 0));
        }

        public void ChangeState(IState new_state)
        {
            m_State = new_state;
            m_StateName = m_State.StateName;

            m_State.Begin();
        }

        private void FixedUpdate()
        {
            currentTime += Time.fixedDeltaTime;
            if (currentTime > allowedIdleTime)
            {
                lost++;
                M_Socket.SocketManager.Instance.WaitAPI();
                currentTime = 0;
            }
            m_State.Update();
            MoveRb(moveInput);
            if(won + lost >= 10)
            {
                if (won >= lost)
                    OnWin.Invoke();
                else OnLose.Invoke();
            }
        }

        public bool IsTargetInsideBox(Collider target, bool isPunch, bool isKick)
        {
            bool inside = target.bounds.Intersects(m_Collider.bounds);

            if (!inside) return false;

            if (isPunch)
            {
                target.GetComponent<Animator>().CrossFadeInFixedTime("Hit", 0.2f);
                M_Socket.SocketManager.Instance.PunchAPI();
                won++;
                currentTime = 0; 
            }
            if (isKick)
            {
                target.GetComponent<Animator>().CrossFadeInFixedTime("Hit", 0.2f);
                M_Socket.SocketManager.Instance.KickAPI();
                won++;
                currentTime = 0; 
            }

            return true;
        }

        void MoveRb(Vector2 input)
        {
            if (!m_RigidBody) return;

            Vector3 dir = new(input.x, 0f, input.y);
            if (dir.sqrMagnitude > 1f) dir.Normalize();

            Vector3 nextPos = m_RigidBody.position + dir * moveSpeed * Time.fixedDeltaTime;
            nextPos.y = m_RigidBody.position.y;
            m_RigidBody.MovePosition(nextPos);

            if (dir.sqrMagnitude > 0.0001f)
            {
                Quaternion targetRot = Quaternion.LookRotation(dir, Vector3.up);
                Quaternion nextRot = Quaternion.Slerp(m_RigidBody.rotation, targetRot, turnSpeed * Time.fixedDeltaTime);
                m_RigidBody.MoveRotation(nextRot);
            }
        }
    }
}