using Sirenix.OdinInspector;
using System.Collections;
using System.Text;
using UnityEngine;
using UnityEngine.Networking;

namespace M_Socket
{
    [HideMonoScript]
    public class SocketManager : MonoBehaviour
    {
        public static SocketManager Instance { get; private set; }

        [SerializeField] private string serverUrl = "http://localhost:5000";

        private void Awake()
        {
            if (Instance != null && Instance != this)
            {
                Destroy(gameObject);
                return;
            }

            Instance = this;
            DontDestroyOnLoad(gameObject);
        }

        [TitleGroup("API Test Buttons")]
        [Button]
        public void PunchAPI()
        {
            SendAddPage(1);
        }

        [TitleGroup("API Test Buttons")]
        [Button]
        public void KickAPI()
        {
            SendAddPage(2);
        }

        [TitleGroup("API Test Buttons")]
        [Button]
        public void WaitAPI()
        {
            SendAddPage(3);
        }

        [TitleGroup("API Test Buttons")]
        [Button]
        public void ResetAPI()
        {
            StartCoroutine(PostReset());
        }
        private void SendAddPage(int page)
        {
            StartCoroutine(PostAdd(page));
        }

        private IEnumerator PostAdd(int page)
        {
            string url = $"{serverUrl}/api/add";

            string jsonBody = $"{{\"page\":{page}}}";
            byte[] bodyRaw = Encoding.UTF8.GetBytes(jsonBody);

            using UnityWebRequest req = new(url, "POST");
            req.uploadHandler = new UploadHandlerRaw(bodyRaw);
            req.downloadHandler = new DownloadHandlerBuffer();
            req.SetRequestHeader("Content-Type", "application/json");

            yield return req.SendWebRequest();
        }

        private IEnumerator PostReset()
        {
            string url = $"{serverUrl}/api/reset";

            using UnityWebRequest req = new(url, "POST");
            req.downloadHandler = new DownloadHandlerBuffer();

            yield return req.SendWebRequest();
        }
    }
}
