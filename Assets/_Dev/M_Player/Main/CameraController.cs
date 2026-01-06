using Sirenix.OdinInspector;
using UnityEngine;
namespace M_Player
{
    [HideMonoScript]
    public class CameraController : MonoBehaviour
    {
        [SerializeField] Transform m_CameraTarget;
        [SerializeField] Vector3 m_PositionOffset = new(0f, 3f, -6f);
        [SerializeField] float positionSmooth = 8f;

        Vector3 desiredPos;

        void LateUpdate()
        {
            if (!m_CameraTarget) return;

            desiredPos = m_CameraTarget.position + m_PositionOffset;

            transform.position = Vector3.Lerp(
                transform.position,
                desiredPos,
                positionSmooth * Time.deltaTime
            );
        }
    }
}